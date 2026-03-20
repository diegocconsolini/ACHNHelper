'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AssetImg } from '../assetHelper';

const THEME_TAGS = [
  'cottagecore', 'urban', 'japanese', 'natural', 'spooky',
  'fairycore', 'tropical', 'medieval', 'modern', 'rustic',
  'zen', 'carnival', 'space', 'underwater', 'forest',
];

const LOOKING_FOR_TAGS = [
  'friends', 'trading', 'flower-watering', 'island-tours',
  'cataloging', 'fishing-buddies', 'just-visiting',
];

const TABS = [
  { id: 'listing', label: 'My Listing', emoji: '📋' },
  { id: 'favorites', label: 'Favorites', emoji: '⭐' },
  { id: 'friends', label: 'Friends', emoji: '🤝' },
  { id: 'blocked', label: 'Blocked', emoji: '🚫' },
];

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
`;

export default function CommunityHub() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('listing');
  const [fadeKey, setFadeKey] = useState(0);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setFadeKey(k => k + 1);
  }, []);

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <style>{fontImport}</style>
        <div style={styles.centerMsg}>
          <span style={{ fontSize: 48 }}>🍃</span>
          <p style={{ color: '#5ec850', marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div style={styles.container}>
        <style>{fontImport}</style>
        <div style={styles.centerMsg}>
          <span style={{ fontSize: 56 }}>🌐</span>
          <h2 style={styles.title}>Community Hub</h2>
          <p style={styles.subtitle}>Sign in to manage your community profile, view favorites, and connect with other islanders.</p>
          <button
            onClick={() => signIn('google')}
            style={styles.signInBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{fontImport}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: 32 }}>🌐</span>
          <div>
            <h1 style={styles.title}>Community Hub</h1>
            <p style={styles.headerSubtitle}>Manage your community listing and connections</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.id ? styles.tabBtnActive : {}),
            }}
          >
            <span style={{ fontSize: 16 }}>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div key={fadeKey} style={styles.tabContent}>
        {activeTab === 'listing' && <MyListingTab session={session} />}
        {activeTab === 'favorites' && <FavoritesTab />}
        {activeTab === 'friends' && <FriendsTab />}
        {activeTab === 'blocked' && <BlockedTab />}
      </div>
    </div>
  );
}

/* ========== MY LISTING TAB ========== */

function MyListingTab({ session }) {
  const [listing, setListing] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  // Form state
  const [bio, setBio] = useState('');
  const [themeTags, setThemeTags] = useState([]);
  const [lookingFor, setLookingFor] = useState([]);
  const [showFriendCode, setShowFriendCode] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Screenshot state
  const [screenshots, setScreenshots] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Load existing listing + profile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [listingRes, profileRes] = await Promise.all([
          fetch('/api/community/publish'),
          fetch('/api/profile'),
        ]);
        const listingData = listingRes.ok ? await listingRes.json() : null;
        const profileData = profileRes.ok ? await profileRes.json() : null;

        if (!cancelled) {
          setProfile(profileData);
          if (listingData) {
            setListing(listingData);
            setBio(listingData.bio || '');
            setThemeTags(listingData.theme_tags || []);
            setLookingFor(listingData.looking_for || []);
            setShowFriendCode(listingData.show_friend_code || false);
            setConsentGiven(listingData.show_friend_code || false);
            setIsPublished(listingData.is_published || false);
            setScreenshots(listingData.screenshots || []);
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handlePublish = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/community/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          themeTags,
          lookingFor,
          showFriendCode,
          consentGiven,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish');
      }
      const data = await res.json();
      setListing(data);
      setIsPublished(true);
      setSaveMsg({ type: 'success', text: 'Listing published!' });
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }, [bio, themeTags, lookingFor, showFriendCode, consentGiven]);

  const handleUpdate = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/community/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          themeTags,
          lookingFor,
          showFriendCode,
          consentGiven,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update');
      }
      const data = await res.json();
      setListing(data);
      setSaveMsg({ type: 'success', text: 'Listing updated!' });
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }, [bio, themeTags, lookingFor, showFriendCode, consentGiven]);

  const handleUnpublish = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/community/publish', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to unpublish');
      setIsPublished(false);
      setSaveMsg({ type: 'success', text: 'Listing unpublished.' });
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }, []);

  const toggleThemeTag = useCallback((tag) => {
    setThemeTags(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      if (prev.length >= 5) return prev;
      return [...prev, tag];
    });
  }, []);

  const toggleLookingFor = useCallback((tag) => {
    setLookingFor(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      if (prev.length >= 3) return prev;
      return [...prev, tag];
    });
  }, []);

  const handleScreenshotUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Client-side validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Use JPEG, PNG, or WebP.');
      setTimeout(() => setUploadError(null), 4000);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File too large. Maximum 2MB.');
      setTimeout(() => setUploadError(null), 4000);
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/community/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const { url } = await res.json();
      setScreenshots(prev => [...prev, url]);
    } catch (err) {
      setUploadError(err.message);
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleScreenshotDelete = useCallback(async (url) => {
    try {
      const res = await fetch('/api/community/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        setScreenshots(prev => prev.filter(s => s !== url));
      }
    } catch {
      // ignore
    }
  }, []);

  if (loading) {
    return (
      <div style={styles.centerMsg}>
        <span style={{ fontSize: 36 }}>🍃</span>
        <p style={{ color: '#5a7a50', marginTop: 8 }}>Loading your listing...</p>
      </div>
    );
  }

  const friendCode = profile?.friend_code || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Published status */}
      <div style={styles.statusBar}>
        <div style={styles.statusLeft}>
          <div style={{
            ...styles.statusDot,
            background: isPublished ? '#5ec850' : '#5a7a50',
          }} />
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            color: isPublished ? '#5ec850' : '#5a7a50',
          }}>
            {isPublished ? 'Published' : 'Not published'}
          </span>
        </div>
        {saveMsg && (
          <span style={{
            fontSize: 13,
            fontFamily: "'DM Mono', monospace",
            color: saveMsg.type === 'success' ? '#5ec850' : '#e05050',
          }}>
            {saveMsg.text}
          </span>
        )}
      </div>

      {/* Bio */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Bio</label>
        <textarea
          value={bio}
          onChange={e => {
            if (e.target.value.length <= 200) setBio(e.target.value);
          }}
          placeholder="Tell other islanders about yourself and your island..."
          rows={3}
          style={styles.textarea}
        />
        <span style={{
          ...styles.hint,
          color: bio.length > 180 ? '#d4b030' : '#3a5a40',
        }}>
          {bio.length}/200 characters
        </span>
      </div>

      {/* Theme Tags */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Island Theme Tags <span style={styles.labelMuted}>(max 5)</span></label>
        <div style={styles.tagGrid}>
          {THEME_TAGS.map(tag => {
            const selected = themeTags.includes(tag);
            const disabled = !selected && themeTags.length >= 5;
            return (
              <button
                key={tag}
                onClick={() => !disabled && toggleThemeTag(tag)}
                style={{
                  ...styles.tagBtn,
                  ...(selected ? styles.tagBtnSelected : {}),
                  ...(disabled ? styles.tagBtnDisabled : {}),
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Looking For Tags */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Looking For <span style={styles.labelMuted}>(max 3)</span></label>
        <div style={styles.tagGrid}>
          {LOOKING_FOR_TAGS.map(tag => {
            const selected = lookingFor.includes(tag);
            const disabled = !selected && lookingFor.length >= 3;
            return (
              <button
                key={tag}
                onClick={() => !disabled && toggleLookingFor(tag)}
                style={{
                  ...styles.tagBtn,
                  ...(selected ? styles.tagBtnLookingSelected : {}),
                  ...(disabled ? styles.tagBtnDisabled : {}),
                }}
              >
                {tag.replace(/-/g, ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Friend Code Visibility */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Friend Code Visibility</label>
        {!friendCode ? (
          <p style={{ fontSize: 13, color: '#5a7a50', lineHeight: 1.5 }}>
            No friend code set. Go to <strong style={{ color: '#d4b030' }}>My Profile</strong> to add your friend code first.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={e => {
                  setConsentGiven(e.target.checked);
                  if (!e.target.checked) setShowFriendCode(false);
                }}
                style={styles.checkbox}
              />
              <span style={{ fontSize: 13, color: '#c8e6c0', lineHeight: 1.5 }}>
                I consent to my friend code ({friendCode}) being visible to logged-in users
              </span>
            </label>
            {consentGiven && (
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={showFriendCode}
                  onChange={e => setShowFriendCode(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={{ fontSize: 13, color: '#c8e6c0' }}>
                  Show friend code on my listing
                </span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Island Screenshots */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          Island Screenshots <span style={styles.labelMuted}>({screenshots.length}/5)</span>
        </label>
        <p style={{ fontSize: 12, color: '#5a7a50', margin: '0 0 4px', lineHeight: 1.4 }}>
          Share photos of your island. JPEG, PNG, or WebP, max 2MB each.
        </p>

        {screenshots.length > 0 && (
          <div style={styles.screenshotGrid}>
            {screenshots.map((url) => (
              <div key={url} style={styles.screenshotThumb}>
                <img
                  src={url}
                  alt="Island screenshot"
                  style={styles.screenshotImg}
                />
                <button
                  onClick={() => handleScreenshotDelete(url)}
                  style={styles.screenshotDeleteBtn}
                  title="Remove screenshot"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        {screenshots.length < 5 && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleScreenshotUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                ...styles.uploadBtn,
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Screenshot'}
            </button>
          </div>
        )}

        {uploadError && (
          <span style={{
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            color: '#e05050',
          }}>
            {uploadError}
          </span>
        )}
      </div>

      {/* Preview Card */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Preview</label>
        <ProfilePreviewCard
          profile={profile}
          bio={bio}
          themeTags={themeTags}
          lookingFor={lookingFor}
          showFriendCode={showFriendCode && consentGiven}
          session={session}
          screenshots={screenshots}
        />
      </div>

      {/* Actions */}
      <div style={styles.actionRow}>
        {!isPublished ? (
          <button
            onClick={handlePublish}
            disabled={saving}
            style={{
              ...styles.publishBtn,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Publishing...' : 'Publish Listing'}
          </button>
        ) : (
          <>
            <button
              onClick={handleUpdate}
              disabled={saving}
              style={{
                ...styles.publishBtn,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleUnpublish}
              disabled={saving}
              style={{
                ...styles.unpublishBtn,
                opacity: saving ? 0.6 : 1,
              }}
            >
              Unpublish
            </button>
          </>
        )}
        <a
          href="/community"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.directoryLink}
        >
          View in Community Directory
        </a>
      </div>
    </div>
  );
}

/* ========== PROFILE PREVIEW CARD ========== */

function ProfilePreviewCard({ profile, bio, themeTags, lookingFor, showFriendCode, session, screenshots = [] }) {
  const islandName = profile?.island_name || 'My Island';
  const hemisphere = profile?.hemisphere;
  const nativeFruit = profile?.native_fruit;
  const nativeFlower = profile?.native_flower;
  const rating = profile?.island_rating;
  const friendCode = profile?.friend_code;
  const dreamAddress = profile?.dream_address;
  const playerName = session?.user?.name || 'Player';

  return (
    <div style={styles.previewCard}>
      <div style={styles.previewHeader}>
        <div style={styles.previewIslandInfo}>
          <span style={{ fontSize: 24 }}>🏝️</span>
          <div>
            <div style={styles.previewIslandName}>{islandName}</div>
            <div style={styles.previewPlayerName}>{playerName}</div>
          </div>
        </div>
        {rating && (
          <div style={styles.previewRating}>
            {Array.from({ length: rating }, (_, i) => (
              <span key={i} style={{ fontSize: 14 }}>⭐</span>
            ))}
          </div>
        )}
      </div>

      {bio && <p style={styles.previewBio}>{bio}</p>}

      {screenshots.length > 0 && (
        <div style={styles.previewScreenshots}>
          {screenshots.slice(0, 3).map((url) => (
            <img
              key={url}
              src={url}
              alt="Island screenshot"
              style={styles.previewScreenshotImg}
            />
          ))}
          {screenshots.length > 3 && (
            <span style={{
              fontSize: 11,
              color: '#5a7a50',
              fontFamily: "'DM Mono', monospace",
              alignSelf: 'center',
            }}>
              +{screenshots.length - 3} more
            </span>
          )}
        </div>
      )}

      <div style={styles.previewDetails}>
        {hemisphere && (
          <span style={styles.previewDetail}>
            {hemisphere === 'north' ? '🌸' : '❄️'} {hemisphere}
          </span>
        )}
        {nativeFruit && (
          <span style={styles.previewDetail}>
            <AssetImg category="other" name={nativeFruit} size={16} />
            <span>{nativeFruit}</span>
          </span>
        )}
        {nativeFlower && (
          <span style={styles.previewDetail}>
            🌺 {nativeFlower}
          </span>
        )}
      </div>

      {themeTags.length > 0 && (
        <div style={styles.previewTagRow}>
          {themeTags.map(tag => (
            <span key={tag} style={styles.previewThemeTag}>{tag}</span>
          ))}
        </div>
      )}

      {lookingFor.length > 0 && (
        <div style={styles.previewTagRow}>
          {lookingFor.map(tag => (
            <span key={tag} style={styles.previewLookingTag}>{tag.replace(/-/g, ' ')}</span>
          ))}
        </div>
      )}

      {showFriendCode && friendCode && (
        <div style={styles.previewFriendCode}>
          <span style={{ fontSize: 12 }}>🎮</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4aacf0' }}>{friendCode}</span>
        </div>
      )}

      {dreamAddress && (
        <div style={styles.previewFriendCode}>
          <span style={{ fontSize: 12 }}>☁️</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#5a7a50' }}>{dreamAddress}</span>
        </div>
      )}
    </div>
  );
}

/* ========== FAVORITES TAB ========== */

function FavoritesTab() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/community/favorites');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!cancelled) setFavorites(data.profiles || []);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleRemove = useCallback(async (userId) => {
    setRemoving(userId);
    try {
      const res = await fetch(`/api/community/favorite/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.user_id !== userId));
      }
    } catch {
      // ignore
    } finally {
      setRemoving(null);
    }
  }, []);

  if (loading) {
    return (
      <div style={styles.centerMsg}>
        <span style={{ fontSize: 36 }}>🍃</span>
        <p style={{ color: '#5a7a50', marginTop: 8 }}>Loading favorites...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={{ fontSize: 48 }}>⭐</span>
        <h3 style={styles.emptyTitle}>No Favorites Yet</h3>
        <p style={styles.emptyText}>
          Browse the <a href="/community" target="_blank" rel="noopener noreferrer" style={styles.inlineLink}>Community Directory</a> and favorite islands you like.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.cardList}>
      {favorites.map(fav => (
        <div key={fav.user_id} style={styles.favCard}>
          <div style={styles.favCardHeader}>
            <div style={styles.favCardInfo}>
              <span style={{ fontSize: 20 }}>🏝️</span>
              <div>
                <div style={styles.favIslandName}>{fav.island_name || 'Unknown Island'}</div>
                <div style={styles.favMeta}>
                  {fav.hemisphere && (
                    <span>{fav.hemisphere === 'north' ? '🌸 North' : '❄️ South'}</span>
                  )}
                  {fav.native_fruit && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AssetImg category="other" name={fav.native_fruit} size={14} />
                      {fav.native_fruit}
                    </span>
                  )}
                  {fav.island_rating && (
                    <span>{'⭐'.repeat(fav.island_rating)}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleRemove(fav.user_id)}
              disabled={removing === fav.user_id}
              style={styles.removeBtn}
            >
              {removing === fav.user_id ? '...' : 'Remove'}
            </button>
          </div>

          {fav.bio && <p style={styles.favBio}>{fav.bio}</p>}

          {(fav.theme_tags?.length > 0 || fav.looking_for?.length > 0) && (
            <div style={styles.favTagRow}>
              {(fav.theme_tags || []).map(tag => (
                <span key={tag} style={styles.previewThemeTag}>{tag}</span>
              ))}
              {(fav.looking_for || []).map(tag => (
                <span key={tag} style={styles.previewLookingTag}>{tag.replace(/-/g, ' ')}</span>
              ))}
            </div>
          )}

          {fav.friend_code && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 12 }}>🎮</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4aacf0' }}>{fav.friend_code}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ========== FRIENDS TAB ========== */

function FriendsTab() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const loadFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/community/friends');
      if (res.ok) setFriends(await res.json());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadFriends();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [loadFriends]);

  const handleRemove = useCallback(async (userId) => {
    setRemoving(userId);
    try {
      const res = await fetch(`/api/community/favorite/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setFriends(prev => prev.filter(f => f.user_id !== userId));
      }
    } catch {
      // ignore
    } finally {
      setRemoving(null);
    }
  }, []);

  if (loading) {
    return (
      <div style={styles.centerMsg}>
        <span style={{ fontSize: 36 }}>🍃</span>
        <p style={{ color: '#5a7a50', marginTop: 8 }}>Loading friends...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={{ fontSize: 48 }}>🤝</span>
        <h3 style={styles.emptyTitle}>No Mutual Friends Yet</h3>
        <p style={styles.emptyText}>
          When you and another player both favorite each other, you become mutual friends. Friend codes are always visible for mutual friends.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.cardList}>
      {friends.map(friend => (
        <div key={friend.user_id} style={styles.friendCard}>
          <div style={styles.favCardHeader}>
            <div style={styles.favCardInfo}>
              <span style={{ fontSize: 20 }}>🏝️</span>
              <div>
                <div style={styles.favIslandName}>{friend.island_name || 'Unknown Island'}</div>
                <div style={styles.favMeta}>
                  {friend.hemisphere && (
                    <span>{friend.hemisphere === 'north' ? '🌸 North' : '❄️ South'}</span>
                  )}
                  {friend.native_fruit && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AssetImg category="other" name={friend.native_fruit} size={14} />
                      {friend.native_fruit}
                    </span>
                  )}
                  {friend.native_flower && (
                    <span>🌺 {friend.native_flower}</span>
                  )}
                  {friend.island_rating && (
                    <span>{'⭐'.repeat(friend.island_rating)}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleRemove(friend.user_id)}
              disabled={removing === friend.user_id}
              style={styles.removeBtn}
            >
              {removing === friend.user_id ? '...' : 'Remove'}
            </button>
          </div>

          {/* Mutual badge */}
          <div style={styles.mutualBadge}>
            <span>🤝</span>
            <span>You both favorited each other!</span>
          </div>

          {/* Dream Address — always visible for friends */}
          {friend.dream_address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12 }}>☁️</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#5a7a50' }}>{friend.dream_address}</span>
            </div>
          )}

          {/* Friend Code — always visible for mutual friends */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 12 }}>🎮</span>
            {friend.friend_code ? (
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#4aacf0' }}>{friend.friend_code}</span>
            ) : (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#5a7a50', fontStyle: 'italic' }}>No friend code shared</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== BLOCKED TAB ========== */

function BlockedTab() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/community/block');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!cancelled) setBlocked(data.blocked || []);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleUnblock = useCallback(async (userId) => {
    setUnblocking(userId);
    try {
      const res = await fetch(`/api/community/block/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setBlocked(prev => prev.filter(b => b.user_id !== userId));
      }
    } catch {
      // ignore
    } finally {
      setUnblocking(null);
    }
  }, []);

  if (loading) {
    return (
      <div style={styles.centerMsg}>
        <span style={{ fontSize: 36 }}>🍃</span>
        <p style={{ color: '#5a7a50', marginTop: 8 }}>Loading...</p>
      </div>
    );
  }

  if (blocked.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={{ fontSize: 48 }}>🚫</span>
        <h3 style={styles.emptyTitle}>No Blocked Users</h3>
        <p style={styles.emptyText}>
          You haven&apos;t blocked anyone. Blocked users won&apos;t appear in your community directory.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.cardList}>
      {blocked.map(b => (
        <div key={b.user_id} style={styles.blockedCard}>
          <div style={styles.blockedCardInner}>
            <div>
              <span style={styles.blockedIsland}>
                {b.island_name || 'Unknown Island'}
              </span>
              <span style={styles.blockedDate}>
                Blocked {new Date(b.blocked_at).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={() => handleUnblock(b.user_id)}
              disabled={unblocking === b.user_id}
              style={styles.unblockBtn}
            >
              {unblocking === b.user_id ? '...' : 'Unblock'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== STYLES ========== */

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a1a10',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
    padding: '32px 40px',
    width: '100%',
  },
  centerMsg: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    textAlign: 'center',
    gap: 8,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 700,
    color: '#5ec850',
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: '#5a7a50',
    maxWidth: 420,
    lineHeight: 1.6,
    marginTop: 8,
  },
  signInBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    marginTop: 16,
    background: 'rgba(94,200,80,0.08)',
    border: '1px solid rgba(94,200,80,0.25)',
    borderRadius: 8,
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: '1px solid rgba(94,200,80,0.15)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#5a7a50',
    marginTop: 2,
  },

  /* Tabs */
  tabBar: {
    display: 'flex',
    gap: 4,
    marginBottom: 28,
    borderBottom: '1px solid rgba(94,200,80,0.1)',
    paddingBottom: 0,
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 18px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#5a7a50',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  },
  tabBtnActive: {
    color: '#5ec850',
    borderBottom: '2px solid #5ec850',
  },
  tabContent: {
    animation: 'none',
  },

  /* Status bar */
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 10,
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'background-color 0.2s ease',
  },

  /* Form fields */
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: "'DM Mono', monospace",
  },
  labelMuted: {
    fontWeight: 400,
    textTransform: 'none',
    letterSpacing: 0,
    color: '#3a5a40',
  },
  textarea: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#c8e6c0',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    resize: 'vertical',
    minHeight: 60,
    transition: 'border-color 0.2s ease',
  },
  hint: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    transition: 'color 0.2s ease',
  },

  /* Tags */
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBtn: {
    padding: '6px 12px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.12)',
    borderRadius: 20,
    color: '#5a7a50',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
    textTransform: 'capitalize',
  },
  tagBtnSelected: {
    background: 'rgba(94,200,80,0.15)',
    border: '1px solid rgba(94,200,80,0.4)',
    color: '#5ec850',
  },
  tagBtnLookingSelected: {
    background: 'rgba(74,172,240,0.12)',
    border: '1px solid rgba(74,172,240,0.4)',
    color: '#4aacf0',
  },
  tagBtnDisabled: {
    opacity: 0.35,
    cursor: 'default',
  },

  /* Checkbox */
  checkboxRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: 3,
    accentColor: '#5ec850',
    cursor: 'pointer',
  },

  /* Action row */
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  publishBtn: {
    padding: '10px 24px',
    background: 'rgba(94,200,80,0.15)',
    border: '1px solid rgba(94,200,80,0.35)',
    borderRadius: 8,
    color: '#5ec850',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  },
  unpublishBtn: {
    padding: '10px 24px',
    background: 'rgba(224,80,80,0.1)',
    border: '1px solid rgba(224,80,80,0.3)',
    borderRadius: 8,
    color: '#e05050',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  },
  directoryLink: {
    fontSize: 13,
    color: '#4aacf0',
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },

  /* Screenshot upload */
  screenshotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 10,
  },
  screenshotThumb: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid rgba(94,200,80,0.15)',
    aspectRatio: '16/9',
  },
  screenshotImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  screenshotDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'rgba(224,80,80,0.85)',
    border: 'none',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    lineHeight: 1,
  },
  uploadBtn: {
    padding: '8px 18px',
    background: 'rgba(74,172,240,0.1)',
    border: '1px solid rgba(74,172,240,0.3)',
    borderRadius: 8,
    color: '#4aacf0',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },

  /* Preview card */
  previewCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewIslandInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  previewIslandName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#5ec850',
  },
  previewPlayerName: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  previewRating: {
    display: 'flex',
    gap: 1,
  },
  previewBio: {
    fontSize: 13,
    color: '#c8e6c0',
    lineHeight: 1.5,
    margin: 0,
  },
  previewScreenshots: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  previewScreenshotImg: {
    width: 80,
    height: 45,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid rgba(94,200,80,0.15)',
  },
  previewDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewDetail: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#5a7a50',
    textTransform: 'capitalize',
  },
  previewTagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  previewThemeTag: {
    padding: '3px 8px',
    background: 'rgba(94,200,80,0.1)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 12,
    fontSize: 11,
    color: '#5ec850',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'capitalize',
  },
  previewLookingTag: {
    padding: '3px 8px',
    background: 'rgba(74,172,240,0.08)',
    border: '1px solid rgba(74,172,240,0.2)',
    borderRadius: 12,
    fontSize: 11,
    color: '#4aacf0',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'capitalize',
  },
  previewFriendCode: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },

  /* Favorites */
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  favCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.12)',
    borderRadius: 10,
    padding: 16,
    transition: 'border-color 0.2s ease',
  },
  favCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  favCardInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  favIslandName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 16,
    fontWeight: 700,
    color: '#5ec850',
  },
  favMeta: {
    display: 'flex',
    gap: 10,
    fontSize: 11,
    color: '#5a7a50',
    marginTop: 2,
  },
  favBio: {
    fontSize: 13,
    color: '#c8e6c0',
    lineHeight: 1.4,
    margin: '8px 0 0',
    opacity: 0.85,
  },
  favTagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  removeBtn: {
    padding: '6px 14px',
    background: 'rgba(212,176,48,0.08)',
    border: '1px solid rgba(212,176,48,0.25)',
    borderRadius: 6,
    color: '#d4b030',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
    flexShrink: 0,
  },

  /* Friends */
  friendCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 10,
    padding: 16,
    transition: 'border-color 0.2s ease',
  },
  mutualBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    background: 'rgba(212,176,48,0.1)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    color: '#d4b030',
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 4,
  },

  /* Blocked */
  blockedCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.08)',
    borderRadius: 10,
    padding: 14,
  },
  blockedCardInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  blockedIsland: {
    fontSize: 14,
    fontWeight: 600,
    color: '#c8e6c0',
    display: 'block',
  },
  blockedDate: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    display: 'block',
    marginTop: 2,
  },
  unblockBtn: {
    padding: '6px 14px',
    background: 'rgba(224,80,80,0.08)',
    border: '1px solid rgba(224,80,80,0.25)',
    borderRadius: 6,
    color: '#e05050',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
    flexShrink: 0,
  },

  /* Empty states */
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 700,
    color: '#5ec850',
    margin: 0,
  },
  emptyText: {
    fontSize: 14,
    color: '#5a7a50',
    maxWidth: 360,
    lineHeight: 1.5,
    margin: 0,
  },
  inlineLink: {
    color: '#4aacf0',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
