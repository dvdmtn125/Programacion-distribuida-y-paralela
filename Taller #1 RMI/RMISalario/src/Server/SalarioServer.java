/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Main.java to edit this template
 */
package Server;

import Implement.SalarioImplement;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

/**
 *
 * @author Mono
 */
public class SalarioServer {

    /**
     * @param args the command line arguments
     * @throws java.rmi.RemoteException
     */
    public static void main(String[] args) throws RemoteException
    {
        try {
            Registry reg = LocateRegistry.createRegistry(1099);
            SalarioImplement salImplement = new SalarioImplement(0,0);
        
            reg.rebind("Salario", salImplement);
            System.out.print("Servidor Iniciado.");
        } catch (RemoteException e) {
            System.out.print(e);
        }
        
    }
    
}
