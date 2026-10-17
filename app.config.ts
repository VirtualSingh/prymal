import type { ConfigContext, ExpoConfig } from "expo/config";

// Static settings live in app.json. This file only adds values that must not
// be committed:
//
// GOOGLE_MAPS_ANDROID_API_KEY: the Google Maps key for the app's own builds
// (Expo Go doesn't need it). Locally it comes from .env.local (gitignored);
// for EAS cloud builds, from an EAS environment variable with "Sensitive"
// visibility (EAS loads plain-text and sensitive variables, not "Secret"
// ones, when it reads this config).
//
// Only a yes/no flag reaches the app's JavaScript (extra.mapsConfigured),
// never the key. The key itself ends up in the APK's AndroidManifest, which
// Android requires; its protection is the key's restrictions in Google Cloud.
export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim();
  const mapsPlugin: [string, { androidGoogleMapsApiKey: string }][] = mapsKey
    ? [["react-native-maps", { androidGoogleMapsApiKey: mapsKey }]]
    : [];

  return {
    ...config,
    name: config.name ?? "prymal",
    slug: config.slug ?? "prymal",
    plugins: [...(config.plugins ?? []), ...mapsPlugin],
    extra: { ...config.extra, mapsConfigured: Boolean(mapsKey) },
  };
};
