/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Implement;

import Interface.SalarioInterface;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;

/**
 *
 * @author Mono
 */
public class SalarioImplement extends UnicastRemoteObject implements SalarioInterface {
    
    public int a; //a Es el numero de Empleados
    public int b; //b Es el numero de Meses
    
    public int getEmpleados() {
        return a;
}
    public void setEmpleado(int a){
        this.a = a;
    }
    
    public int getMeses() {
        return b;
    }
    
    public void setMeses(int b) {
        this.b = b;
    }
    
    private double[][] matriz;
    private double[] sueldos;
    private double[] promedios;
    
    public SalarioImplement(int a, int b) throws RemoteException {
        this.a = a;
        this.b = b;
    }
    
    @Override
    public String calcSalario(int a, int b) throws RemoteException {
        this.matriz = new double[a][b];
        this.sueldos = new double[a];
        this.promedios = new double[b];
        double total = 0;
        //Alternativa a String para concatenar resultados de manera eficiente
        StringBuilder resultado = new StringBuilder(); 
        
        //Llenar la matriz con numeros aleatorios entre 1000 y 10000
        for (int i = 0; i < a; i++) {
            for (int j = 0; j < b; j++) {
                // Salario aleatorio entre 1000 y 10000
                this.matriz[i][j] = (int)(Math.random() * 9000 + 1000);
            }
        }
        
        //Imprimir la matriz
        resultado.append("=== MATRIZ DE SALARIOS ===\n");
        System.out.println("=== MATRIZ DE SALARIOS ===");
        
        // Encabezado de meses
        String encabezado = "Empleado\t";
        for (int j = 0; j < b; j++) {
            encabezado += "Mes " + (j + 1) + "\t";
        }
        encabezado += "\n";
        resultado.append(encabezado);
        System.out.println(encabezado);
        
        // Imprimir filas con salarios
        for (int i = 0; i < a; i++) {
            String fila = "Empleado " + (i + 1) + "\t";
            for (int j = 0; j < b; j++) {
                fila += this.matriz[i][j] + "\t";
            }
            fila += "\n";
            resultado.append(fila);
            System.out.println(fila);
        }
        resultado.append("\n");
        System.out.println();
        
        //Calcular el sueldo total de cada empleado
        for (int i = 0; i < a; i++) {
            for (int j = 0; j < b; j++) {
                this.sueldos[i] += this.matriz[i][j];
            }
            String linea = "Sueldo Empleado " + (i + 1) + ": " + this.sueldos[i] + "\n";
            resultado.append(linea);
            System.out.println(linea);
        }
        
        //Calcular el promedio de cada mes
        for (int j = 0; j < b; j++) {
            for (int i = 0; i < a; i++) {
                this.promedios[j] += this.matriz[i][j];
            }
            this.promedios[j] /= a;
            String linea = "Promedio Mes " + (j + 1) + ": " + this.promedios[j] + "\n";
            resultado.append(linea);
            System.out.println(linea);
        }

        //calcular el total de sueldos
        for (int i = 0; i < a; i++) {
            total += this.sueldos[i];
        }
        String linea = "Total Sueldos: " + total;
        resultado.append(linea);
        System.out.println(linea);
        
        return resultado.toString();
    }
    
    public double[] getPromedios() {
        return this.promedios;
    }
    
    public double[] getSueldos() {
        return this.sueldos;
    }
    
    public double[][] getMatriz() {
        return this.matriz;
    }

}
