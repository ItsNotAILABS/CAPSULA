# CAPSULA Expo Go Showcase

This folder documents the mobile demo route for CAPSULA.

## Goal

Give a founder, user, or investor a phone-based preview without waiting for App Store or Play Store distribution.

## Generate the mobile capsule

```bash
python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile
cd .capsula/expo/capsula-mobile
npm install
npm run start
```

Open Expo Go on the phone and scan the QR code.

## Showcase screen set

The first mobile showcase should contain:

1. CAPSULA landing screen
2. template picker
3. bot operator map
4. protocol card stack
5. deployment target picker
6. funding/evidence screen
7. contact/request-access screen

## Acceptance

- QR code loads on a real phone.
- User understands CAPSULA in under two minutes.
- The app says what is demo, what is implemented, and what is planned.
- The GitHub repo is linked from the app.
