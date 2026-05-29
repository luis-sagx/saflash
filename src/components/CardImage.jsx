// saflash — CardImage component
import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { RADIUS } from '../theme/spacing';
import { COLORS } from '../theme/colors';

export default function CardImage({ uri, style, size = 180 }) {
  const [hasError, setHasError] = useState(false);

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: RADIUS.lg,
  };

  if (hasError || !uri) {
    return (
      <Image
        source={require('../../assets/images/placeholder.png')}
        style={[styles.placeholder, imageStyle, style]}
      />
    );
  }

  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      style={[imageStyle, style]}
      resizeMode={FastImage.resizeMode.cover}
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#F5F5F5',
  },
});
