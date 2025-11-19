// src/screens/thrive/ThriveCreatePost.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  PenSquare,
  Image as ImageIcon,
  Globe,
  Camera,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { createThrivePost } from '../../api/thrive';
import { api } from '../../api/client';

type ThriveStackParamList = {
  ThriveCreatePost: undefined;
  // plus your other routes; if this file is separate, reuse same type definition as navigator
};

type Nav = NativeStackNavigationProp<ThriveStackParamList, 'ThriveCreatePost'>;

// ---- helper: upload to /api/employee/thrive/posts/media ----
async function uploadImageAsync(localUri: string): Promise<string> {
  const formData = new FormData();

  const uriParts = localUri.split('/');
  const filename = uriParts[uriParts.length - 1] || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';

  const mimeType =
    ext === 'png'
      ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : 'image/*';

  // IMPORTANT: use { uri, name, type } in RN – no blob()
  formData.append(
    'file',
    {
      uri: localUri,
      name: filename,
      type: mimeType,
    } as any
  );

  console.log(
    '[UPLOAD] baseURL =',
    // @ts-ignore
    api.defaults?.baseURL,
    ' → /api/employee/thrive/posts/media'
  );

  const res = await api.post(
    '/api/employee/thrive/posts/media',
    formData,
    {
      headers: {
        // let axios set the boundary, but we still say multipart
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data, // don't JSON-serialize FormData
    }
  );

  console.log('[UPLOAD] response', res.data);

  if (!res.data || !res.data.success || !res.data.url) {
    const msg =
      res.data?.error?.message ||
      res.data?.message ||
      'Upload failed on server.';
    throw new Error(msg);
  }

  // returns something like "/uploads/thrive/xyz.jpg"
  return res.data.url as string;
}

export default function ThriveCreatePost() {
  const navigation = useNavigation<Nav>();

  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'company' | 'public'>('company');

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const canSubmit = caption.trim().length > 0 && !submitting && !uploading;

  // -------- image from gallery --------
  const pickFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // NEW API – avoids deprecation warning
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.uri) return;

      setLocalImageUri(asset.uri);
      setRemoteImageUrl(null);

      setUploading(true);
      const url = await uploadImageAsync(asset.uri);
      setRemoteImageUrl(url);
    } catch (err: any) {
      console.log('pickFromLibrary error', err);
      Alert.alert(
        'Error',
        err?.message || 'Could not pick/upload image.'
      );
      setLocalImageUri(null);
      setRemoteImageUrl(null);
    } finally {
      setUploading(false);
    }
  };

  // -------- image from camera --------
  const captureFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.uri) return;

      setLocalImageUri(asset.uri);
      setRemoteImageUrl(null);

      setUploading(true);
      const url = await uploadImageAsync(asset.uri);
      setRemoteImageUrl(url);
    } catch (err: any) {
      console.log('captureFromCamera error', err);
      Alert.alert(
        'Error',
        err?.message || 'Could not capture/upload image.'
      );
      setLocalImageUri(null);
      setRemoteImageUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setLocalImageUri(null);
    setRemoteImageUrl(null);
  };

  // -------- submit post --------
  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const mediaUrl = remoteImageUrl || undefined;
      const mediaType = mediaUrl ? 'image' : 'none';

      const res = await createThrivePost({
        caption: caption.trim(),
        mediaUrl,
        mediaType,
        visibility,
      });

      if (!res.success) {
        Alert.alert('Error', (res as any).error || 'Could not create post.');
        return;
      }

      navigation.goBack();
    } catch (err) {
      console.log('handleSubmit error', err);
      Alert.alert('Error', 'Something went wrong while creating the post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={['#ec4899', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <PenSquare size={18} color="#fff" />
            <Text style={styles.headerTitle}>New Post</Text>
          </View>
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.postBtn,
              !canSubmit && { opacity: 0.5 },
              pressed && canSubmit && { opacity: 0.8 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </Pressable>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.body}>
        {/* Caption */}
        <View style={styles.card}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Share how you're thriving today..."
            placeholderTextColor="#9ca3af"
            style={styles.captionInput}
            multiline
            maxLength={400}
          />
          <View style={styles.captionFooter}>
            <Text style={styles.captionCount}>{caption.length}/400</Text>
          </View>
        </View>

        {/* Image picker */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <ImageIcon size={18} color="#4b5563" />
              <Text style={styles.cardTitle}>Image (optional)</Text>
            </View>
            {uploading && (
              <View style={styles.row}>
                <ActivityIndicator size="small" />
                <Text style={{ marginLeft: 6, fontSize: 11, color: '#6b7280' }}>
                  Uploading...
                </Text>
              </View>
            )}
          </View>

          <View style={styles.imageActionsRow}>
            <Pressable style={styles.imageBtn} onPress={captureFromCamera}>
              <Camera size={16} color="#111827" />
              <Text style={styles.imageBtnText}>Camera</Text>
            </Pressable>
            <Pressable style={styles.imageBtn} onPress={pickFromLibrary}>
              <ImageIcon size={16} color="#111827" />
              <Text style={styles.imageBtnText}>Gallery</Text>
            </Pressable>
          </View>

          {localImageUri && (
            <View style={styles.previewWrapper}>
              <Image source={{ uri: localImageUri }} style={styles.previewImage} />
              <Pressable style={styles.removeBadge} onPress={clearImage}>
                <X size={14} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>

        {/* Visibility */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <Globe size={18} color="#4b5563" />
              <Text style={styles.cardTitle}>Visibility</Text>
            </View>
          </View>
          <View style={styles.visibilityRow}>
            <Pressable
              onPress={() => setVisibility('company')}
              style={[
                styles.visibilityChip,
                visibility === 'company' && styles.visibilityChipActive,
              ]}
            >
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'company' && styles.visibilityTextActive,
                ]}
              >
                Company
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setVisibility('public')}
              style={[
                styles.visibilityChip,
                visibility === 'public' && styles.visibilityChipActive,
              ]}
            >
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'public' && styles.visibilityTextActive,
                ]}
              >
                Public
              </Text>
            </Pressable>
          </View>
          <Text style={styles.visibilityHint}>
            Company posts are only visible inside your organization.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelText: { color: '#f9fafb', fontSize: 14, fontWeight: '600' },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  postBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fb7185', // bright pink for visibility
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  body: { flex: 1, padding: 16, rowGap: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  captionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#111827',
  },
  captionFooter: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  captionCount: { fontSize: 11, color: '#9ca3af' },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  imageActionsRow: {
    flexDirection: 'row',
    columnGap: 8,
    marginTop: 10,
  },
  imageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  imageBtnText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },

  previewWrapper: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  visibilityRow: {
    flexDirection: 'row',
    columnGap: 8,
    marginTop: 8,
  },
  visibilityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  visibilityChipActive: {
    backgroundColor: '#db2777',
    borderColor: '#db2777',
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  visibilityTextActive: {
    color: '#fff',
  },
  visibilityHint: {
    marginTop: 6,
    fontSize: 11,
    color: '#6b7280',
  },
});
