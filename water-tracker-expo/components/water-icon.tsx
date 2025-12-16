import React from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Colors } from '@/constants/theme';

interface WaterIconProps {
  size?: number;
  color?: string;
}

export function WaterIcon({ size = 80, color = Colors.light.tint }: WaterIconProps) {
  return (
    <FontAwesome5
      name="tint"
      size={size}
      color={color}
    />
  );
}
