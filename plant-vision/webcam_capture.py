import cv2
import time
import base64
import requests
import json
from datetime import datetime

class PlantVisionCapture:
    def __init__(self, camera_index=0, ai_service_url="http://localhost:5001/classify"):
        self.camera_index = camera_index
        self.ai_service_url = ai_service_url
        self.cap = None
        self.last_classification = None
        self.running = False

    def start_camera(self):
        """Inicializar la cámara"""
        self.cap = cv2.VideoCapture(self.camera_index)

        if not self.cap.isOpened():
            print(f"❌ Error: No se pudo abrir la cámara {self.camera_index}")
            # Intentar con cámara 1 si la 0 falla
            self.camera_index = 1
            self.cap = cv2.VideoCapture(self.camera_index)

        if not self.cap.isOpened():
            print("❌ Error: No hay cámaras disponibles")
            return False

        print(f"📹 Cámara {self.camera_index} iniciada correctamente")
        return True

    def capture_and_classify(self):
        """Capturar una foto y clasificarla"""
        if not self.cap or not self.cap.isOpened():
            return None

        ret, frame = self.cap.read()
        if not ret:
            print("❌ Error: No se pudo capturar el frame")
            return None

        # Guardar imagen temporal
        image_name = "temp_capture.jpg"
        cv2.imwrite(image_name, frame)
        print(f"📸 Foto capturada: {image_name}")

        # Leer imagen como binario y codificar en base64
        try:
            with open(image_name, "rb") as img_file:
                img_base64 = base64.b64encode(img_file.read()).decode('utf-8')

            # Enviar a nuestro servicio mock de IA
            response = requests.post(
                self.ai_service_url,
                json={"image": img_base64},  # Enviamos como JSON
                headers={"Content-Type": "application/json"},
                timeout=5
            )

            if response.status_code == 200:
                result = response.json()
                plant_name = result.get('top', 'desconocida')
                confidence = result.get('confidence', 0.0)

                classification = {
                    'plant': plant_name,
                    'confidence': confidence,
                    'timestamp': datetime.now().isoformat(),
                    'full_response': result
                }

                self.last_classification = classification
                print(f"🧠 IA detectó: {plant_name} (confianza: {confidence:.2%})")
                return classification

            else:
                print(f"❌ Error en respuesta de IA: {response.status_code}")
                return None

        except Exception as e:
            print(f"❌ Error al clasificar: {e}")
            return None

    def get_last_classification(self):
        """Obtener la última clasificación"""
        return self.last_classification

    def run_continuous(self, interval_seconds=10):
        """Ejecutar captura continua cada X segundos"""
        if not self.start_camera():
            return

        cv2.namedWindow("Plant Vision - Webcam", cv2.WINDOW_NORMAL)
        self.running = True

        print(f"🔄 Iniciando captura continua cada {interval_seconds} segundos")
        print("Presiona 'q' para salir, 'c' para clasificar manualmente")

        last_classification_time = 0

        try:
            while self.running:
                ret, frame = self.cap.read()
                if not ret:
                    break

                # Mostrar el frame con información
                display_frame = frame.copy()

                # Añadir información de la última clasificación
                if self.last_classification:
                    plant = self.last_classification['plant']
                    conf = self.last_classification['confidence']
                    text = f"Planta: {plant} ({conf:.1%})"
                    cv2.putText(display_frame, text, (10, 30),
                              cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                # Mostrar tiempo hasta próxima clasificación
                current_time = time.time()
                time_since_last = current_time - last_classification_time
                time_until_next = max(0, interval_seconds - time_since_last)

                status_text = f"Proxima clasificacion en: {time_until_next:.1f}s"
                cv2.putText(display_frame, status_text, (10, 70),
                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

                cv2.imshow("Plant Vision - Webcam", display_frame)

                # Clasificación automática cada X segundos
                if time_since_last >= interval_seconds:
                    self.capture_and_classify()
                    last_classification_time = current_time

                # Manejar teclas
                key = cv2.waitKey(100) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('c'):
                    print("🔍 Clasificación manual...")
                    self.capture_and_classify()
                    last_classification_time = current_time

        except KeyboardInterrupt:
            print("🛑 Captura detenida por el usuario")

        self.stop()

    def stop(self):
        """Detener la captura y liberar recursos"""
        self.running = False
        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()
        print("📹 Cámara liberada")

# Script principal
if __name__ == "__main__":
    print("🌿 Plant Vision - Clasificador de Plantas")
    print("🎯 Asegúrate de que el servidor mock esté corriendo en puerto 5000")

    # Crear instancia del capturador
    vision = PlantVisionCapture(
        camera_index=0,  # Cambiar a 1 si tienes problemas
        ai_service_url="http://localhost:5000/classify"
    )

    # Ejecutar captura continua cada 10 segundos
    vision.run_continuous(interval_seconds=10)