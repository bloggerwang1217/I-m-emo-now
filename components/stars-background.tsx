import { View, StyleSheet } from 'react-native';
import { Colors, AppColors } from '@/constants/theme';

// Star colors with distribution percentages
const STAR_COLORS = [
  { color: AppColors.ivory, weight: 0.7 },        // 70% white stars
  { color: AppColors.mutedGold, weight: 0.2 },   // 20% gold stars
  { color: AppColors.softRust, weight: 0.1 },    // 10% rust stars
];

// Get color based on index
const getStarColor = (index: number) => {
  const random = (index * 17 + 23) % 100; // Pseudo-random 0-99
  if (random < 70) return STAR_COLORS[0].color;      // 70% ivory
  if (random < 90) return STAR_COLORS[1].color;      // 20% gold
  return STAR_COLORS[2].color;                       // 10% rust
};

// Sparkle star component (8-pointed star shape with diagonals)
const SparkleStar = ({ size, color }: {
  size: number;
  color: string;
}) => {
  const lineLength = size * 3;
  const lineThickness = Math.max(0.5, size / 4);
  const diagonalLength = lineLength * 0.7; // Shorter diagonals

  return (
    <View style={{ position: 'relative' }}>
      {/* Horizontal line */}
      <View
        style={{
          width: lineLength,
          height: lineThickness,
          backgroundColor: color,
          position: 'absolute',
          left: -lineLength / 2,
          top: -lineThickness / 2,
        }}
      />
      {/* Vertical line */}
      <View
        style={{
          width: lineThickness,
          height: lineLength,
          backgroundColor: color,
          position: 'absolute',
          left: -lineThickness / 2,
          top: -lineLength / 2,
        }}
      />
      {/* Diagonal line (top-left to bottom-right) */}
      <View
        style={{
          width: diagonalLength,
          height: lineThickness,
          backgroundColor: color,
          position: 'absolute',
          left: -diagonalLength / 2,
          top: -lineThickness / 2,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {/* Diagonal line (top-right to bottom-left) */}
      <View
        style={{
          width: diagonalLength,
          height: lineThickness,
          backgroundColor: color,
          position: 'absolute',
          left: -diagonalLength / 2,
          top: -lineThickness / 2,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
};

export default function StarsBackground() {
  // Create a pseudo-random pattern of stars
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: ((i * 37 + 13) % 100),
    top: ((i * 41 + 7) % 100),
    size: (i % 3) + 2, // 2-4
    color: getStarColor(i),
    opacity: 0.08 + ((i * 7) % 15) / 100, // 0.08-0.23 very subtle
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} pointerEvents="none">
      {stars.map((star) => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.left}%`,
            top: `${star.top}%`,
            opacity: star.opacity,
          }}>
          <SparkleStar size={star.size} color={star.color} />
        </View>
      ))}
    </View>
  );
}
