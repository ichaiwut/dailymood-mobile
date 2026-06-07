/**
 * Edit profile (/profile/edit). Name, bio, accent color (PATCH /api/profile);
 * email is read-only. Avatar upload (premium) is deferred to the image
 * milestone (needs the picker + optimize pipeline).
 */
import { useState, useEffect } from 'react';
import { View, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { Notice } from '../../src/components/Notice';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useProfile, useUpdateProfile, useUploadAvatar } from '../../src/hooks/queries';
import { pickImage, optimizeImage } from '../../src/lib/image';
import { initials } from '../../src/lib/avatar';
import { errorMessageKey } from '../../src/api/errors';

const ACCENTS = ['#A673F1', '#FCA45B', '#85ECCB', '#FDCB56', '#9ACDE2', '#D4BEE4'];

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { colors, radius, space } = useTheme();
  const router = useRouter();
  const profile = useProfile();
  const update = useUpdateProfile();
  const upload = useUploadAvatar();
  const premium = profile.data?.user.isPremium ?? false;
  const avatarUrl = profile.data?.user.imageUrl ?? null;

  const onAvatar = async () => {
    if (!premium) {
      router.push('/profile/subscription');
      return;
    }
    const picked = await pickImage();
    if (picked) upload.mutate(await optimizeImage(picked));
  };

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.data) {
      setName(profile.data.user.name ?? '');
      setBio(profile.data.user.bio ?? '');
      setAccent(profile.data.user.accentColor || ACCENTS[0]);
    }
  }, [profile.data]);

  const onSave = async () => {
    setError(null);
    try {
      await update.mutateAsync({ name: name.trim(), bio: bio.trim(), accentColor: accent });
      router.back();
    } catch (e) {
      setError(t(errorMessageKey(e)));
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text variant="title" color={colors.ink}>‹</Text>
        </Pressable>
        <Text variant="title">{t('profile.editProfile')}</Text>
        <View style={{ width: 20 }} />
      </View>

      {profile.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : (
        <>
          {error ? <Notice message={error} tone="error" /> : null}

          {/* avatar */}
          <View style={{ alignItems: 'center', gap: space.sm }}>
            <Pressable onPress={onAvatar} style={{ position: 'relative' }}>
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={{ width: 96, height: 96 }} />
                ) : (
                  <Text variant="h1" color="#fff">{initials(name, profile.data?.user.email)}</Text>
                )}
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.bg,
                }}
              >
                {upload.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ fontSize: 14 }}>📷</Text>
                )}
              </View>
            </Pressable>
            {!premium ? (
              <Text variant="label" color={colors.ink3}>✦ {t('subscription.pro')}</Text>
            ) : null}
          </View>

          <TextField label={t('profile.name')} value={name} onChangeText={setName} maxLength={30} />
          <TextField
            label={t('profile.bio')}
            value={bio}
            onChangeText={setBio}
            maxLength={160}
            multiline
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          {/* accent picker */}
          <View style={{ gap: space.sm }}>
            <Text variant="label" color={colors.ink2}>{t('profile.accentColor')}</Text>
            <View style={{ flexDirection: 'row', gap: space.md }}>
              {ACCENTS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setAccent(c)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: c,
                    borderWidth: accent === c ? 3 : 0,
                    borderColor: colors.ink,
                  }}
                />
              ))}
            </View>
          </View>

          {/* email read-only */}
          <View style={{ gap: 6 }}>
            <Text variant="label" color={colors.ink2}>{t('profile.email')}</Text>
            <View
              style={{
                backgroundColor: colors.surface2,
                borderRadius: radius.md,
                paddingVertical: 14,
                paddingHorizontal: space.lg,
                opacity: 0.7,
              }}
            >
              <Text variant="body" color={colors.ink2}>{profile.data?.user.email}</Text>
            </View>
          </View>

          <Button label={t('profile.save')} onPress={onSave} loading={update.isPending} />
        </>
      )}
    </Screen>
  );
}
