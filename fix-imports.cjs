const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

// Reemplazos específicos
for(let file of files){
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix en App.jsx (movido a app/App.jsx)
    if(file.replace(/\\/g, '/').endsWith('app/App.jsx')) {
        content = content.replace(/from '\.\/context/g, "from '../context");
        content = content.replace(/from '\.\/hooks/g, "from '../hooks");
        content = content.replace(/from '\.\/views/g, "from '../views");
        content = content.replace(/from '\.\/components/g, "from '../components");
        
        // Ahora las views están en features
        content = content.replace(/from '\.\.\/views\/GaleriaView/g, "from '../features/gallery/views/GaleriaView");
        content = content.replace(/from '\.\.\/views\/VotarView/g, "from '../features/voting/views/VotarView");
        content = content.replace(/from '\.\.\/views\/DjView/g, "from '../features/dj/views/DjView");
        content = content.replace(/from '\.\.\/views\/ProyectorView/g, "from '../features/voting/views/ProyectorView");
        content = content.replace(/from '\.\.\/views\/LoginView/g, "from '../features/auth/views/LoginView");
        content = content.replace(/from '\.\.\/views\/InvitadosAdminView/g, "from '../features/admin/views/InvitadosAdminView");
        
        content = content.replace(/from '\.\.\/components\/SafariEnforcer/g, "from '../components/layout/SafariEnforcer");
    }

    // Fix en main.jsx (movido a app/main.jsx)
    if(file.replace(/\\/g, '/').endsWith('app/main.jsx')) {
        // App.jsx y index.css están en el mismo dir
    }

    // En los Features
    
    // Auth
    if(file.replace(/\\/g, '/').includes('features/auth/views/LoginView.jsx')) {
        content = content.replace(/\.\.\/services\/firebaseConfig/g, '../../services/firebase/config');
        content = content.replace(/\.\.\/components\/login\//g, '../components/');
    }
    if(file.replace(/\\/g, '/').includes('features/auth/components')) {
        content = content.replace(/import book([0-9]+) from '\.\.\/\.\.\/assets\/book([0-9]+)\.jpeg';/g, "const book$1 = '/images/book/book$2.jpeg';");
    }

    // Gallery
    if(file.replace(/\\/g, '/').includes('features/gallery/views/GaleriaView.jsx')) {
        content = content.replace(/\.\.\/components\/AdminTrigger/g, '../../../features/admin/components/AdminTrigger');
        content = content.replace(/\.\.\/context\/AuthContext/g, '../../../context/AuthContext');
        content = content.replace(/\.\.\/hooks\/useOnlineStatus/g, '../../../hooks/useOnlineStatus');
        content = content.replace(/\.\.\/hooks\/useMuro/g, '../hooks/useMuro');
        content = content.replace(/\.\.\/utils\/cloudinaryUtils/g, '../../../utils/cloudinaryUtils');
    }
    if(file.replace(/\\/g, '/').includes('features/gallery/hooks/useMuro.js')) {
        content = content.replace(/\.\.\/services\/firebaseConfig/g, '../../../services/firebase/config');
    }

    // Voting
    if(file.replace(/\\/g, '/').includes('features/voting/views/VotarView.jsx')) {
        content = content.replace(/\.\.\/components\/AdminTrigger/g, '../../../features/admin/components/AdminTrigger');
        content = content.replace(/\.\.\/context\/AuthContext/g, '../../../context/AuthContext');
        content = content.replace(/\.\.\/hooks\/useVotaciones/g, '../hooks/useVotaciones');
        content = content.replace(/\.\.\/hooks\/useResultadosVotos/g, '../hooks/useResultadosVotos');
        content = content.replace(/\.\.\/config\/categorias/g, '../../../config/categorias');
        content = content.replace(/\.\.\/hooks\/useOnlineStatus/g, '../../../hooks/useOnlineStatus');
    }
    if(file.replace(/\\/g, '/').includes('features/voting/views/ProyectorView.jsx')) {
        content = content.replace(/\.\.\/hooks\/useResultadosVotos/g, '../hooks/useResultadosVotos');
        content = content.replace(/\.\.\/config\/categorias/g, '../../../config/categorias');
        content = content.replace(/\.\.\/hooks\/useVotaciones/g, '../hooks/useVotaciones');
    }
    if(file.replace(/\\/g, '/').includes('features/voting/hooks')) {
        content = content.replace(/\.\.\/services\/firebaseConfig/g, '../../../services/firebase/config');
    }

    // DJ
    if(file.replace(/\\/g, '/').includes('features/dj/views/DjView.jsx')) {
        content = content.replace(/\.\.\/hooks\/usePedidosDj/g, '../hooks/usePedidosDj');
        content = content.replace(/\.\.\/hooks\/useOnlineStatus/g, '../../../hooks/useOnlineStatus');
    }
    if(file.replace(/\\/g, '/').includes('features/dj/hooks/usePedidosDj.js')) {
        content = content.replace(/\.\.\/services\/firebaseConfig/g, '../../../services/firebase/config');
    }

    // Admin
    if(file.replace(/\\/g, '/').includes('features/admin/views/InvitadosAdminView.jsx')) {
        content = content.replace(/\.\.\/services\/firebaseConfig/g, '../../../services/firebase/config');
    }

    // Context / Auth Context
    if(file.replace(/\\/g, '/').includes('context/AuthContext.jsx')) {
        content = content.replace(/\.\.\/services\/firebaseConfig/g, '../services/firebase/config');
    }

    // Auth Form
    if(file.replace(/\\/g, '/').includes('features/auth/components/AuthForm.jsx')) {
        // En caso que use auth de un context o algo, verificamos si llama a un hook
        content = content.replace(/\.\.\/\.\.\/context\/AuthContext/g, '../../../context/AuthContext');
        content = content.replace(/\.\.\/\.\.\/services\/firebaseConfig/g, '../../../services/firebase/config');
    }

    if(content !== original){
        fs.writeFileSync(file, content, 'utf8');
        console.log("Updated: ", file);
    }
}
