import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase/db';
import { useAuth } from '../../../context/AuthContext';

const normalizeText = (text) => {
  if (!text) return '';
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const useBuscarMesa = () => {
  const { currentUser, loading: authLoading } = useAuth();
  
  const [userTable, setUserTable] = useState(null); // { nombre, mesa }
  const [loadingTable, setLoadingTable] = useState(true);
  
  const [invitados, setInvitados] = useState([]);
  const [loadingInvitados, setLoadingInvitados] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  
  // Caso A: Usuario Logueado
  useEffect(() => {
    if (authLoading) return;
    
    const checkUserTable = async () => {
      if (currentUser?.email) {
        setLoadingTable(true);
        try {
          const q = query(
            collection(db, 'invitados'),
            where('email', '==', currentUser.email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const guestData = querySnapshot.docs[0].data();
            setUserTable(guestData);
          }
        } catch (error) {
          console.error("Error buscando mesa del usuario:", error);
        } finally {
          setLoadingTable(false);
        }
      } else {
        setLoadingTable(false);
      }
    };
    
    checkUserTable();
  }, [currentUser, authLoading]);
  
  // Caso B: Cargar todos los invitados para búsqueda si no se encontró mesa directa
  useEffect(() => {
    // Si todavía estamos verificando o ya encontramos la mesa, no cargamos toda la lista
    if (authLoading || loadingTable || userTable || selectedGuest) return;
    
    setLoadingInvitados(true);
    const q = query(collection(db, 'invitados'), orderBy('nombre'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvitados(data);
      setLoadingInvitados(false);
    }, (error) => {
      console.error("Error cargando invitados:", error);
      setLoadingInvitados(false);
    });
    
    // Limpiar listener para evitar fugas de memoria
    return () => unsubscribe();
  }, [authLoading, loadingTable, userTable, selectedGuest]);
  
  // Filtrado en el cliente (mínimo 2 caracteres)
  const searchResults = useMemo(() => {
    const term = normalizeText(searchTerm.trim());
    if (term.length < 2) return [];
    
    return invitados.filter(invitado => 
      normalizeText(invitado.nombre).includes(term)
    );
  }, [invitados, searchTerm]);

  return {
    authLoading,
    loadingTable,
    userTable,
    
    loadingInvitados,
    searchTerm,
    setSearchTerm,
    searchResults,
    
    selectedGuest,
    setSelectedGuest
  };
};
