from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import time
import random

app = Flask(__name__)
CORS(app)  # Permitir CORS para que el backend Node.js pueda llamar

# Mock data - simula respuestas de Roboflow
MOCK_PLANTS = {
    'romero': {
        'class': 'romero',
        'class_id': 1,
        'confidence': 0.9796
    },
    'menta': {
        'class': 'menta',
        'class_id': 2,
        'confidence': 0.9542
    }
}

@app.route('/classify', methods=['POST'])
def classify_plant():
    """
    Endpoint que simula la clasificación de Roboflow
    Por ahora siempre devuelve 'romero' para testing
    """
    try:
        # Simular tiempo de procesamiento de IA
        time.sleep(0.1)

        # Para testing, siempre devolvemos romero
        # Más tarde puedes cambiar esto para alternar o usar lógica real
        plant_type = 'romero'
        plant_data = MOCK_PLANTS[plant_type]

        # Simular la respuesta exacta de Roboflow
        response = {
            "inference_id": str(uuid.uuid4()),
            "time": round(random.uniform(0.08, 0.15), 5),
            "image": {
                "width": 640,
                "height": 480
            },
            "predictions": [{
                "class": plant_data['class'],
                "class_id": plant_data['class_id'],
                "confidence": plant_data['confidence']
            }],
            "top": plant_data['class'],
            "confidence": plant_data['confidence']
        }

        print(f"🧠 IA Mock clasificó: {plant_type} (confianza: {plant_data['confidence']})")
        return jsonify(response)

    except Exception as e:
        print(f"❌ Error en clasificación: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de estado del servicio"""
    return jsonify({
        "status": "OK",
        "service": "Plant Vision Mock",
        "available_plants": list(MOCK_PLANTS.keys())
    })

@app.route('/humidity', methods=['GET'])
def get_humidity():
    """Endpoint que devuelve humedad real del Arduino"""
    import serial

    try:
        # Conectar al Arduino
        arduino = serial.Serial(port='/dev/cu.usbserial-110', baudrate=9600, timeout=2)
        time.sleep(0.5)  # Esperar conexión

        # Enviar comando para pedir humedad (asumiendo comando 'H')
        arduino.write(b'H')

        # Leer respuesta del Arduino
        response_line = arduino.readline().decode('utf-8').strip()
        arduino.close()

        # Parsear "Humidity: 45.2%" -> extraer 45.2
        if "Humidity:" in response_line:
            humidity_str = response_line.split("Humidity:")[1].strip().replace("%", "")
            humidity_value = float(humidity_str)
        else:
            raise ValueError(f"Formato inesperado del Arduino: {response_line}")

        response = {
            "humidity": humidity_value,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "unit": "%",
            "sensor": "arduino",
            "raw_response": response_line
        }

        print(f"💧 Humedad Arduino: {humidity_value}% (raw: {response_line})")
        return jsonify(response)

    except Exception as e:
        print(f"❌ Error en lectura de humedad: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/toggle-plant', methods=['POST'])
def toggle_plant():
    """
    Endpoint para cambiar manualmente entre plantas durante testing
    """
    data = request.get_json()
    plant_type = data.get('plant', 'romero')

    if plant_type in MOCK_PLANTS:
        # Aquí podrías guardar el estado para próximas clasificaciones
        return jsonify({
            "message": f"Próxima clasificación será: {plant_type}",
            "plant": plant_type
        })
    else:
        return jsonify({"error": "Planta no disponible"}), 400

if __name__ == '__main__':
    print("🤖 Iniciando servicio de Plant Vision Mock...")
    print("📡 Endpoints disponibles:")
    print("   POST /classify - Clasificar planta (siempre devuelve romero)")
    print("   GET /health - Estado del servicio")
    print("   GET /humidity - Obtener humedad simulada")
    print("   POST /toggle-plant - Cambiar planta manualmente")
    print("🚀 Servidor corriendo en http://localhost:5001")

    app.run(host='0.0.0.0', port=5001, debug=True)