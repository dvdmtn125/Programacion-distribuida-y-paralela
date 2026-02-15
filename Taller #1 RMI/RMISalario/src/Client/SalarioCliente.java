/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package Client;

import Interface.SalarioInterface;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.rmi.Naming;
import java.rmi.NotBoundException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Mono
 */
public class SalarioCliente {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        int a = 0; //a Es el numero de Empleados
        int b = 0; //b Es el numero de Meses
        try {
            SalarioInterface salario = (SalarioInterface) Naming.lookup("rmi://localhost/Salario");
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
            System.out.print("Ingrese el numero de empleados: ");
            a = Integer.parseInt(reader.readLine());
            System.out.print("Ingrese el numero de meses: ");
            b = Integer.parseInt(reader.readLine());
            String resultado = salario.calcSalario(a, b);
            System.out.println("\n=== RESULTADOS ===");
            System.out.println(resultado);
        } catch (NotBoundException | IOException ex) {
            Logger.getLogger(SalarioCliente.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
}
