// AfriPay Pro — API base URL configuration
//
// Choose the value that matches how you're running the app and edit
// DEVICE_LAN_IP below if your machine's LAN IP is different from the
// default used during development.
//
//  - Physical device via Expo Go (default, most common): use your computer's
//    LAN IP so the phone (on the same Wi-Fi) can reach the backend, e.g.
//    "http://192.168.1.71:4000/api". Find your IP with `ipconfig` (Windows).
//  - Android emulator: the emulator maps the host machine to 10.0.2.2, so use
//    "http://10.0.2.2:4000/api".
//  - iOS simulator: the simulator shares the host's network stack, so
//    "http://localhost:4000/api" works.

const DEVICE_LAN_IP = '192.168.1.71';

const HOSTS = {
  device: `http://${DEVICE_LAN_IP}:4000/api`,
  androidEmulator: 'http://10.0.2.2:4000/api',
  iosSimulator: 'http://localhost:4000/api',
};

// Default target — change this line if you're on an emulator/simulator
// instead of a physical device.
export const API_BASE_URL = HOSTS.device;

export default API_BASE_URL;
