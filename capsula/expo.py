from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Dict, List


@dataclass
class ExpoCapsule:
    name: str
    slug: str
    platforms: List[str] = field(default_factory=lambda: ["ios", "android", "web"])

    def app_json(self) -> Dict[str, object]:
        return {
            "expo": {
                "name": self.name,
                "slug": self.slug,
                "version": "0.1.0",
                "orientation": "portrait",
                "scheme": self.slug,
                "platforms": self.platforms,
                "assetBundlePatterns": ["**/*"],
                "extra": {"capsula": True},
            }
        }


def create_expo_capsule(root: Path, app: ExpoCapsule) -> Dict[str, str]:
    root.mkdir(parents=True, exist_ok=True)
    package = {
        "private": True,
        "scripts": {"start": "expo start", "android": "expo start --android", "ios": "expo start --ios", "web": "expo start --web"},
        "dependencies": {"expo": "latest", "expo-status-bar": "latest", "react": "latest", "react-native": "latest", "react-native-web": "latest", "@expo/metro-runtime": "latest"},
        "devDependencies": {"@babel/core": "latest", "typescript": "latest"},
    }
    app_tsx = """import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>CAPSULA Studio</Text>
      <Text style={styles.title}>Mobile Capsule Preview</Text>
      <Text style={styles.body}>Generate apps inside CAPSULA, preview them in Expo Go, and publish the capsule back to GitHub.</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090c', alignItems: 'center', justifyContent: 'center', padding: 24 },
  kicker: { color: '#d7b46d', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  title: { color: '#f4f0e7', fontSize: 34, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  body: { color: 'rgba(244,240,231,.72)', fontSize: 16, lineHeight: 24, textAlign: 'center' }
});
"""
    files = {
        "app.json": json.dumps(app.app_json(), indent=2) + "\n",
        "package.json": json.dumps(package, indent=2) + "\n",
        "App.tsx": app_tsx,
        "capsula.mobile.json": json.dumps({"kind": "expo-go", "app": asdict(app), "deploy": "github"}, indent=2) + "\n",
        "README.md": f"# {app.name}\n\nRun with Expo Go:\n\n```bash\nnpm install\nnpm run start\n```\n\nScan the QR code with Expo Go.\n",
    }
    for name, content in files.items():
        (root / name).write_text(content, encoding="utf-8")
    return {name: str(root / name) for name in files}
