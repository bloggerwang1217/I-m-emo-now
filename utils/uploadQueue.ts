import NetInfo from '@react-native-community/netinfo';
import { uploadSessionMetadata, uploadVideoFile } from './api';
import {
  addToUploadQueue,
  updateUploadQueueStatus,
  getPendingUploads,
  getDatabase,
  UploadQueueRecord,
  removeFromUploadQueue,
} from './database';

class UploadQueue {
  private queue: Map<string, UploadQueueRecord> = new Map();
  private isProcessing = false;
  private networkListener: any = null;
  private retryTimer: any = null;
  private maxRetries = 3;
  private retryDelayMs = 5000; // Start with 5 seconds

  /**
   * Initialize the upload queue and set up network monitoring
   */
  public async initialize(): Promise<void> {
    console.log('Initializing upload queue...');

    try {
      // Load queue from SQLite database
      await this.loadQueueFromDatabase();
      console.log(`Loaded ${this.queue.size} items from database`);
    } catch (error) {
      console.error('Error loading queue from database:', error);
    }

    // Set up network state listener
    this.setupNetworkMonitoring();

    // Check if network is available and process queue
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      this.processQueue();
    }
  }

  /**
   * Clean up listeners and resources
   */
  public cleanup(): void {
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  /**
   * Add an item to the upload queue
   * This is the single entry point for adding items - handles all persistence
   */
  public async addToQueue(
    item: Omit<
      UploadQueueRecord,
      | 'status'
      | 'retry_count'
      | 'created_at'
      | 'next_retry_at'
      | 'uploaded_at'
      | 'error_message'
    >
  ): Promise<void> {
    const queueItem: UploadQueueRecord = {
      ...item,
      status: 'pending',
      retry_count: 0,
      error_message: null,
      created_at: Date.now(),
      next_retry_at: 0,
      uploaded_at: null,
    };

    this.queue.set(item.id, queueItem);
    console.log('Added to upload queue:', item.id);

    // Save to SQLite database - this is the single source of truth
    try {
      await addToUploadQueue(queueItem);
      console.log('Successfully saved item to database:', item.id);
    } catch (error) {
      console.error('Error saving item to database:', error);
      // Remove from memory if database save failed
      this.queue.delete(item.id);
      throw error;
    }

    // Try to process the queue immediately if network is available
    this.processQueue();
  }

  /**
   * Get the current queue items
   */
  public getQueueItems(): UploadQueueRecord[] {
    return Array.from(this.queue.values());
  }

  /**
   * Get a specific queue item
   */
  public getQueueItem(id: string): UploadQueueRecord | undefined {
    return this.queue.get(id);
  }

  /**
   * Get pending items count
   */
  public getPendingCount(): number {
    return Array.from(this.queue.values()).filter(
      (item) => item.status === 'pending' || item.status === 'failed'
    ).length;
  }

  /**
   * Remove an item from the queue
   */
  public removeFromQueue(id: string): void {
    this.queue.delete(id);
    console.log('Removed from queue:', id);

    // Remove from SQLite database
    removeFromUploadQueue(id).catch((error) => {
      console.error('Error removing item from database:', error);
    });
  }

  /**
   * Clear all queue items
   * Note: This clears the entire upload queue from both memory and database
   */
  public async clearQueue(): Promise<void> {
    try {
      // Clear from memory
      this.queue.clear();

      // Clear from SQLite database - single efficient operation
      const database = getDatabase();
      await database.execAsync('DELETE FROM upload_queue;');

      console.log('Queue cleared successfully');
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  }

  /**
   * Setup network state monitoring
   */
  private setupNetworkMonitoring(): void {
    this.networkListener = NetInfo.addEventListener((state) => {
      console.log('Network state changed:', state);

      if (state.isConnected && !this.isProcessing) {
        console.log('Network restored, processing queue...');
        this.processQueue();
      }
    });
  }

  /**
   * Process the upload queue with pagination
   * Processes items in batches to avoid loading too many items into memory at once
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const now = Date.now();
      // Process items in batches of 5 to avoid memory issues with large queues
      const BATCH_SIZE = 5;
      let offset = 0;
      let hasMoreItems = true;

      while (hasMoreItems) {
        // Get the next batch from database
        const dbItems = await getPendingUploads(BATCH_SIZE, offset);

        if (dbItems.length === 0) {
          hasMoreItems = false;
          break;
        }

        // Filter items that are ready to be retried (nextRetryAt has passed)
        const itemsToProcess = dbItems.filter(
          (dbItem) => dbItem.next_retry_at <= now
        );

        // Convert database records to queue items
        for (const dbItem of itemsToProcess) {
          // Update memory cache
          this.queue.set(dbItem.id, dbItem);

          // Process the item
          await this.processItem(dbItem);
        }

        // Move to next batch
        offset += BATCH_SIZE;
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue item
   */
  private async processItem(item: UploadQueueRecord): Promise<void> {
    // Check network connectivity before processing
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      console.log('Network not available, skipping item:', item.id);
      return;
    }

    // Check retry limit
    if (item.retry_count >= this.maxRetries) {
      this.updateItemStatus(item.id, 'failed');
      console.error('Max retries exceeded for item:', item.id);
      return;
    }

    // Update status to uploading
    this.updateItemStatus(item.id, 'uploading');

    try {
      // Parallel upload: upload metadata and video at the same time
      // since sessionId is generated on frontend
      const uploadPromises = [
        uploadSessionMetadata(
          item.session_id,
          item.timestamp,
          item.emotion_score,
          item.latitude,
          item.longitude
        ),
      ];

      // Add video upload if available
      if (item.video_uri) {
        uploadPromises.push(uploadVideoFile(item.session_id, item.video_uri));
      }

      // Wait for both uploads to complete in parallel
      const [metadataResponse, videoResponse] = await Promise.all(uploadPromises);

      if (!metadataResponse.success) {
        throw new Error(metadataResponse.error || 'Failed to upload metadata');
      }

      // If there's a video, check its response
      if (item.video_uri && videoResponse && !videoResponse.success) {
        throw new Error(videoResponse.error || 'Failed to upload video');
      }

      // Mark as completed and persist the upload timestamp
      this.queue.delete(item.id);
      await updateUploadQueueStatus(item.id, 'completed');
      console.log('Successfully uploaded item:', item.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error processing item:', item.id, errorMessage);

      // Increment retry count and schedule retry
      item.retry_count += 1;
      this.updateItemStatus(item.id, 'failed', errorMessage);

      // Calculate next retry time with exponential backoff
      if (item.retry_count < this.maxRetries) {
        const delay = this.retryDelayMs * Math.pow(2, item.retry_count - 1);
        item.next_retry_at = Date.now() + delay;
        console.log(`Scheduled retry for ${item.id} at ${new Date(item.next_retry_at).toISOString()} (${delay}ms delay)`);

        // Update status and retry time in SQLite database
        await updateUploadQueueStatus(
          item.id,
          'failed',
          item.retry_count,
          errorMessage
        ).catch((err) => {
          console.error('Error updating queue status in database:', err);
        });

        // Schedule delayed retry with a timer
        this.scheduleQueueProcessing(delay);
      } else {
        // Max retries exceeded, save final state
        console.error('Max retries exceeded for item:', item.id);
        await updateUploadQueueStatus(
          item.id,
          'failed',
          item.retry_count,
          errorMessage
        ).catch((err) => {
          console.error('Error updating queue status in database:', err);
        });
      }
    }
  }

  /**
   * Update the status of a queue item
   */
  private updateItemStatus(
    id: string,
    status: UploadQueueRecord['status'],
    errorMessage?: string
  ): void {
    const item = this.queue.get(id);
    if (item) {
      item.status = status;
      if (errorMessage) {
        item.error_message = errorMessage;
      }
    }
  }

  /**
   * Load queue from SQLite database
   * Also resets any 'uploading' items to 'pending' to handle app crashes
   */
  private async loadQueueFromDatabase(): Promise<void> {
    try {
      const records = await getPendingUploads();
      this.queue.clear();

      let uploadingItemsReset = 0;

      for (const record of records) {
        // Reset 'uploading' status to 'pending' in case app crashed mid-upload
        if (record.status === 'uploading') {
          await updateUploadQueueStatus(record.id, 'pending');
          uploadingItemsReset++;
          console.log('Reset uploading item to pending:', record.id);
        }

        this.queue.set(record.id, record);
      }

      if (uploadingItemsReset > 0) {
        console.warn(`Reset ${uploadingItemsReset} items from 'uploading' to 'pending'`);
      }

      console.log('Queue loaded from database:', records.length, 'items');
    } catch (error) {
      console.error('Error loading queue from database:', error);
      throw error;
    }
  }

  /**
   * Schedule queue processing after a delay
   * Handles retry timing with exponential backoff persistence
   */
  private scheduleQueueProcessing(delay: number): void {
    // Clear existing timer if any
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    // Schedule next processing
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.processQueue();
    }, delay);

    console.log(`Queue processing scheduled in ${delay}ms`);
  }
}

// Export singleton instance
export const uploadQueue = new UploadQueue();
