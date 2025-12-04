import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

import { Colors, Typography, Spacing, BorderRadius, ButtonStyles } from '@/constants/theme';
import {
  getAllSessions,
  deleteSession,
  exportSessionsToCSV,
  Session,
  getPendingUploads,
  getAllUploadRecords,
  UploadQueueRecord,
  updateUploadQueueStatus,
  clearFailedUploads,
} from '@/utils/database';
import { uploadQueue } from '@/utils/uploadQueue';
import StarsBackground from '@/components/stars-background';

const EMOTION_EMOJIS = ['😢', '😟', '😐', '😊', '😄'];

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pendingUploads, setPendingUploads] = useState<UploadQueueRecord[]>([]);
  const [failedCount, setFailedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const loadSessions = async () => {
    try {
      const [sessionsData, allUploads, pending] = await Promise.all([
        getAllSessions(),
        getAllUploadRecords(),
        getPendingUploads(),
      ]);

      setSessions(sessionsData);
      setPendingUploads(allUploads);

      // Count failed uploads from pending
      const failed = pending.filter((r) => r.status === 'failed').length;
      setFailedCount(failed);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load history. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Get upload status for a session by timestamp
  const getUploadRecord = (timestamp: string): UploadQueueRecord | undefined => {
    const date = new Date(timestamp);
    return pendingUploads.find((r) => {
      const recordDate = new Date(r.timestamp);
      return Math.abs(recordDate.getTime() - date.getTime()) < 1000; // Within 1 second
    });
  };

  const handleRetryAll = async () => {
    setIsRetrying(true);
    try {
      // Reset failed items to pending with retry_count = 0
      const failedItems = pendingUploads.filter((r) => r.status === 'failed');
      
      for (const item of failedItems) {
        await updateUploadQueueStatus(item.id, 'pending', 0, null);
      }

      // Re-initialize upload queue to pick up the reset items
      await uploadQueue.initialize();
      
      // Reload to show updated status
      await loadSessions();
      
      if (failedItems.length > 0) {
        Alert.alert('Retry Started', `Retrying ${failedItems.length} failed upload(s).`);
      }
    } catch (error) {
      console.error('Error retrying uploads:', error);
      Alert.alert('Error', 'Failed to retry uploads. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClearFailed = async () => {
    Alert.alert(
      'Clear Failed Uploads',
      'This will remove all failed uploads from the queue. You will need to re-submit these check-ins if you want to upload them.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearFailedUploads();
              await loadSessions();
              Alert.alert('Cleared', 'Failed uploads have been removed.');
            } catch (error) {
              console.error('Error clearing failed uploads:', error);
            }
          },
        },
      ]
    );
  };

  // Load sessions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSessions();
  };

  const handleDelete = (session: Session) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (session.id) {
                await deleteSession(session.id);
                loadSessions();
              }
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Generate CSV content
      const csvContent = await exportSessionsToCSV();

      // Create a temporary file
      const fileName = `imo_emo_now_export_${new Date().getTime()}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Emotion Data',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      // Parse ISO format with timezone info
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      // Parse ISO format with timezone info
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid time';
    }
  };

  const getUploadStatusBadge = (timestamp: string) => {
    const queueRecord = getUploadRecord(timestamp);

    if (!queueRecord) {
      return { label: 'Local', color: Colors.text.secondary, icon: 'checkmark-outline' };
    }

    switch (queueRecord.status) {
      case 'pending':
        return { label: 'Pending', color: Colors.interactive.primary, icon: 'time-outline' };
      case 'uploading':
        return { label: 'Uploading', color: Colors.interactive.primary, icon: 'cloud-upload-outline' };
      case 'completed':
        return { label: 'Uploaded', color: Colors.status.success, icon: 'cloud-done-outline' };
      case 'failed':
        return { label: 'Failed', color: Colors.status.error, icon: 'alert-circle-outline' };
      default:
        return { label: 'Unknown', color: Colors.text.secondary, icon: 'help-outline' };
    }
  };

  const renderSessionItem = ({ item }: { item: Session }) => {
    const emoji = EMOTION_EMOJIS[item.emotion_score - 1] || '😐';
    const uploadStatus = getUploadStatusBadge(item.timestamp);

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionEmoji}>
            <Text style={styles.sessionEmojiText}>{emoji}</Text>
          </View>

          <View style={styles.sessionInfo}>
            <Text style={styles.sessionDate}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.sessionTime}>{formatTime(item.timestamp)}</Text>
          </View>

          <View style={styles.uploadBadge}>
            <Ionicons name={uploadStatus.icon as any} size={14} color={uploadStatus.color} />
            <Text style={[styles.uploadBadgeText, { color: uploadStatus.color }]}>
              {uploadStatus.label}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={20} color={Colors.status.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="happy-outline" size={16} color={Colors.text.secondary} />
            <Text style={styles.detailText}>Emotion Score: {item.emotion_score}/5</Text>
          </View>

          {item.latitude && item.longitude && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {item.video_filename && (
            <View style={styles.detailRow}>
              <Ionicons name="videocam-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.detailText}>Video recorded ✓</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={64} color={Colors.text.secondary} />
      <Text style={styles.emptyStateTitle}>No Entries Yet</Text>
      <Text style={styles.emptyStateText}>
        Complete your first check-in to start tracking your emotional journey
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.interactive.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StarsBackground />
      <View style={styles.header}>
        <Text style={styles.title}>Your Emotional Journey</Text>
        <Text style={styles.subtitle}>{sessions.length} entries recorded</Text>
      </View>

      {/* Failed uploads banner */}
      {failedCount > 0 && (
        <View style={styles.failedBanner}>
          <View style={styles.failedBannerContent}>
            <Ionicons name="cloud-offline-outline" size={20} color={Colors.status.error} />
            <Text style={styles.failedBannerText}>
              {failedCount} upload{failedCount > 1 ? 's' : ''} failed
            </Text>
          </View>
          <View style={styles.failedBannerButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFailed}>
              <Ionicons name="trash-outline" size={16} color={Colors.status.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
              onPress={handleRetryAll}
              disabled={isRetrying}>
              {isRetrying ? (
                <ActivityIndicator color={Colors.text.inverse} size="small" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={16} color={Colors.text.inverse} />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {sessions.length > 0 && (
        <TouchableOpacity
          style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={isExporting}>
          {isExporting ? (
            <ActivityIndicator color={Colors.text.inverse} size="small" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color={Colors.text.inverse} />
              <Text style={styles.exportButtonText}>Export Data (CSV)</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={[
          styles.listContainer,
          sessions.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.interactive.primary}
            colors={[Colors.interactive.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.divider,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
  },
  failedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(251, 73, 52, 0.15)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.status.error,
  },
  failedBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  failedBannerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.status.error,
    fontFamily: Typography.fontFamily.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  failedBannerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clearButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.error,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ButtonStyles.primary.backgroundColor,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily.primary,
  },
  listContainer: {
    padding: Spacing.lg,
  },
  listContainerEmpty: {
    flex: 1,
  },
  sessionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sessionEmoji: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sessionEmojiText: {
    fontSize: 28,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
  },
  sessionTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
    marginTop: 2,
  },
  uploadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.primary,
    marginRight: Spacing.sm,
  },
  uploadBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.primary,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  sessionDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Typography.fontFamily.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontFamily: Typography.fontFamily.primary,
    textAlign: 'center',
  },
});
