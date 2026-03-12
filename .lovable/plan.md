

## Problem

The current `appId` in `capacitor.config.ts` is `app.lovable.2fc7b9e2e7d041b39b05178a47f441b8` — this is invalid because Android/iOS package IDs cannot start segments with numbers or contain hyphens.

## Fix

Update `capacitor.config.ts` to use a valid Java-style package ID:

```typescript
appId: 'com.homehub.app',
```

That's the only change needed. After this, `npx cap add android` will work.

