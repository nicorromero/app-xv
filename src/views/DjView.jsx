import React from 'react';
import { usePedidosDj } from '../hooks/usePedidosDj';

const btnVoto = { backgroundColor: '#e0218a', color: 'white', border: 'none', padding: '15px', margin: '5px', cursor: 'pointer', borderRadius: '10px', width: '100%', fontWeight: 'bold' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#1a1a1a', color: 'white' };

function DjView() {
  const { pedidos, nuevaCancion, setNuevaCancion, enviarPedido } = usePedidosDj();

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ color: '#e0218a' }}>Pedile un tema al DJ</h2>
      <form onSubmit={enviarPedido} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          placeholder="Nombre de la canción"
          value={nuevaCancion.nombre}
          onChange={(e) => setNuevaCancion({ ...nuevaCancion, nombre: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Artista"
          value={nuevaCancion.artista}
          onChange={(e) => setNuevaCancion({ ...nuevaCancion, artista: e.target.value })}
          style={inputStyle}
        />
        <button type="submit" style={btnVoto}>Enviar Pedido</button>
      </form>

      <h3 style={{ marginTop: '30px' }}>Pedidos Recientes:</h3>
      <div style={{ textAlign: 'left' }}>
        {pedidos.map(p => (
          <p key={p.id} style={{ borderBottom: '1px solid #333', padding: '5px' }}>
            <strong>{p.nombre}</strong> - {p.artista}
          </p>
        ))}
      </div>
    </div>
  );
}

export default DjView;
