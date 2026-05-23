import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase/db';
import { useAuth } from '../../../context/AuthContext';

/**
 * Normaliza texto: minúsculas, sin acentos, sin espacios extra.
 * "Nicolás  Romero" → "nicolas romero"
 */
const normalize = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

/**
 * Filtra invitados con búsqueda flexible:
 * - Ignora mayúsculas, acentos
 * - Ignora orden de palabras (escribir "Romero Nico" encuentra "Nicolás Romero")
 * - Palabras incompletas combinadas ("rom nico" coincide)
 */
const filtrarInvitados = (invitados, term) => {
  const termNorm = normalize(term);
  if (termNorm.length < 2) return [];

  const palabras = termNorm.split(/\s+/).filter(Boolean);

  return invitados.filter((inv) => {
    const nombreCompleto = normalize(`${inv.nombre || ''} ${inv.apellido || ''}`);
    return palabras.every((p) => nombreCompleto.includes(p));
  });
};

export const useBuscarMesa = () => {
  const { currentUser, isAnonymous, loading: authLoading } = useAuth();

  // Mesa encontrada automáticamente (usuario con cuenta vinculada)
  const [userTable, setUserTable] = useState(null);
  const [loadingTable, setLoadingTable] = useState(true);

  // Lista completa de invitados (solo se carga si se necesita el buscador)
  const [invitados, setInvitados] = useState([]);
  const [loadingInvitados, setLoadingInvitados] = useState(false);
  const invitadosFetched = useRef(false);

  // Estado del buscador manual
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);

  // ── CASO A: Usuario con email (Google o email/pass) ─────────────────────────
  // Busca directamente por email vinculado en Firestore.
  useEffect(() => {
    if (authLoading) return;

    if (currentUser?.email) {
      setLoadingTable(true);
      const buscarPorEmail = async () => {
        try {
          const q = query(
            collection(db, 'invitados'),
            where('email', '==', currentUser.email.toLowerCase().trim())
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setUserTable({ id: snap.docs[0].id, ...snap.docs[0].data() });
          }
        } catch (err) {
          console.error('[useBuscarMesa] Error buscando por email:', err);
        } finally {
          setLoadingTable(false);
        }
      };
      buscarPorEmail();
    } else {
      // Sin email: anónimo o sin cuenta → mostrar buscador directamente
      setLoadingTable(false);
    }
  }, [currentUser, authLoading]);

  // ── CARGA DE LISTA: Solo cuando se necesita el buscador ────────────────────
  // Condiciones: auth resuelto + no tiene mesa automática + no hay guest seleccionado
  // + no es una carga ya iniciada
  useEffect(() => {
    if (authLoading || loadingTable || userTable || invitadosFetched.current) return;

    invitadosFetched.current = true;
    setLoadingInvitados(true);

    const cargarInvitados = async () => {
      try {
        const q = query(collection(db, 'invitados'), orderBy('nombre'));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setInvitados(data);
      } catch (err) {
        console.error('[useBuscarMesa] Error cargando lista de invitados:', err);
      } finally {
        setLoadingInvitados(false);
      }
    };

    cargarInvitados();
  }, [authLoading, loadingTable, userTable]);

  // ── CASO B: Auto-vinculación por displayName de Google ─────────────────────
  // Solo aplica si: tiene displayName, NO encontró por email, y la lista ya cargó.
  useEffect(() => {
    if (
      authLoading ||
      loadingTable ||
      userTable ||
      invitados.length === 0 ||
      !currentUser?.displayName
    ) return;

    const googleNorm = normalize(currentUser.displayName);
    const coincidencia = invitados.find((inv) => {
      const nombreBase = normalize(`${inv.nombre || ''} ${inv.apellido || ''}`);
      return nombreBase === googleNorm;
    });

    if (coincidencia) {
      setUserTable(coincidencia);

      // Vincula el email para que la próxima vez entre por Caso A (sin consultar la lista)
      if (!coincidencia.email && currentUser.email) {
        updateDoc(doc(db, 'invitados', coincidencia.id), {
          email: currentUser.email.toLowerCase().trim(),
        }).catch((err) => console.error('[useBuscarMesa] Error vinculando email:', err));
      }
    }
  }, [invitados, currentUser, authLoading, loadingTable, userTable]);

  // ── BÚSQUEDA FLEXIBLE en cliente ────────────────────────────────────────────
  const searchResults = useMemo(
    () => filtrarInvitados(invitados, searchTerm),
    [invitados, searchTerm]
  );

  // Derivados de estado para la vista
  const needsSearch = !authLoading && !loadingTable && !userTable;
  const isAnonymousUser = isAnonymous || (!currentUser?.email && currentUser !== null);

  return {
    // Estado de carga
    authLoading,
    loadingTable,
    loadingInvitados,

    // Resultado automático (usuario con cuenta vinculada)
    userTable,

    // Buscador manual (usuarios anónimos o sin vinculación)
    needsSearch,
    isAnonymousUser,
    searchTerm,
    setSearchTerm,
    searchResults,

    // Invitado seleccionado de la lista
    selectedGuest,
    setSelectedGuest,
  };
};