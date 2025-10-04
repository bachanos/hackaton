import serial
import time

arduino = serial.Serial(port='/dev/cu.usbserial-110', baudrate=9600, timeout=1)
time.sleep(2)  # esperar a que Arduino reinicie

while True:
    comando = input("Escribe 1 para encender, 0 para apagar: ")
    if comando in ["0", "1"]:
        arduino.write(comando.encode())
        print("Enviado:", comando)
    else:
        print("Comando inválido")

    # Leer datos del Arduino
    while arduino.in_waiting > 0:
        linea = arduino.readline().decode('utf-8').strip()
        if linea:
            print("Arduino dice:", linea)