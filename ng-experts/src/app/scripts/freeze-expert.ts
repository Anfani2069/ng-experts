import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

/**
 * Script pour geler le profil d'un expert pendant 1 minute (test)
 * npx ts-node --project src/app/scripts/tsconfig.json src/app/scripts/freeze-expert.ts
 */

const app = initializeApp(environment.firebase);
const db  = getFirestore(app);

async function freezeExpert() {
  console.log('🔍 Recherche de "Abou Ounyb"...');

  // Chercher par firstName
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'expert')
  );
  const snap = await getDocs(q);

  let found = false;
  for (const d of snap.docs) {
    const data = d.data();
    const fullName = `${data['firstName'] || ''} ${data['lastName'] || ''}`.trim();
    if (fullName.toLowerCase().includes('abou') || fullName.toLowerCase().includes('ounyb')) {
      console.log(`✅ Trouvé : ${fullName} (ID: ${d.id})`);

      const frozenUntil = new Date(Date.now() + 60 * 1000); // +1 minute
      await updateDoc(doc(db, 'users', d.id), {
        frozenUntil:    frozenUntil,
        freezeStrikes:  0,
        isPublic:       false,
        isAvailable:    false,
        updatedAt:      new Date()
      });

      console.log(`🧊 Profil gelé jusqu'à : ${frozenUntil.toLocaleTimeString('fr-FR')}`);
      console.log(`   isPublic: false, isAvailable: false`);
      console.log(`   Le profil sera automatiquement dégelé dans 1 minute.`);
      found = true;
      break;
    }
  }

  if (!found) {
    console.log('❌ Expert non trouvé. Voici les experts disponibles :');
    snap.docs.forEach(d => {
      const data = d.data();
      console.log(`   - ${data['firstName']} ${data['lastName']} (${d.id})`);
    });
  }

  process.exit(0);
}

freezeExpert();
