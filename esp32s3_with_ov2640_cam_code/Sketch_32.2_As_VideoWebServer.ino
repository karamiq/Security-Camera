#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include "esp_camera.h"
#include "src/camera_config/sd_read_write.h"

// =============== WIFI ===============
WiFiMulti wifiMulti;
const char* SSID_NAME = "gohst";
const char* SSID_PASS = "07709590600";

// Static IP (optional, for camera server)
IPAddress local_IP(192,168,0,109);
IPAddress gateway(192,168,0,1);
IPAddress subnet(255,255,255,0);

// =============== SERVOS ===============
Servo servoX;
Servo servoY;
const int SERVO_X_PIN = 20;
const int SERVO_Y_PIN = 21;

// =============== CAMERA ===============
#define CAMERA_MODEL_ESP32S3_EYE // Has PSRAM
#include "src/camera_config/camera_pins.h"

void cameraInit();
void startCameraServer();

// =============== API =================
const char* SERVER_URL_GET = "http://192.168.0.107:3000/movement/servo-angles";

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // ===== Camera setup =====
  cameraInit();
  sdmmcInit();
  removeDir(SD_MMC, "/video");
  createDir(SD_MMC, "/video");

  // ===== Servo setup =====
  servoX.attach(SERVO_X_PIN);
  servoY.attach(SERVO_Y_PIN);

  // ===== WiFi setup =====
  wifiMulti.addAP(SSID_NAME, SSID_PASS);

  // Try static IP
  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("⚠️ Static IP failed to configure!");
  }

  Serial.println("Connecting to WiFi...");
  while (wifiMulti.run() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // Start camera server
  startCameraServer();

  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");
}

// ================= LOOP =================
void loop() {
  // Handle WiFi reconnect if disconnected
  if (WiFi.status() != WL_CONNECTED) {
    wifiMulti.run();
    return;
  }

  // Fetch servo angles from server and update servos
  fetchServoAngles();

  delay(50); // reduce server load
}

// ================= FUNCTIONS =================
void fetchServoAngles() {
  HTTPClient http;
  http.begin(SERVER_URL_GET);

  int httpCode = http.GET();
  if (httpCode == 200) {
    StaticJsonDocument<200> doc;
    String payload = http.getString();

    if (deserializeJson(doc, payload) == DeserializationError::Ok) {
      int x = constrain(doc["x"] | 90, 0, 180);
      int y = constrain(doc["y"] | 90, 0, 180);

      Serial.print("Servo X: ");
      Serial.print(x);
      Serial.print("  Servo Y: ");
      Serial.println(y);

      servoX.write(x);
      servoY.write(y);
    }
  }

  http.end();
}

// ================= CAMERA FUNCTIONS =================
void cameraInit() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  if(psramFound()) {
    config.jpeg_quality = 10;
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.fb_location = CAMERA_FB_IN_DRAM;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return;
  }

  sensor_t * s = esp_camera_sensor_get();
  s->set_vflip(s, 1);
  s->set_brightness(s, 1);
  s->set_saturation(s, 0);
}
