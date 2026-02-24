import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { environment } from '../../environments/environment';

/**
 * Script pour créer un compte administrateur
 * npx ts-node --project src/app/scripts/tsconfig.json src/app/scripts/seed-admin.ts
 */

const ADMIN_EMAIL    = 'abdouanfani2@gmail.com';
const ADMIN_PASSWORD = '14031998An-';
const ADMIN_FIRST    = 'Abdou';
const ADMIN_LAST     = 'ANFANI';

const app  = initializeApp(environment.firebase);
const db   = getFirestore(app);
const auth = getAuth(app);

async function seedAdmin() {
  console.log('🛡️  Création du compte admin...');
  console.log(`   Email : ${ADMIN_EMAIL}`);

  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    await updateProfile(cred.user, { displayName: `${ADMIN_FIRST} ${ADMIN_LAST}` });
    console.log('✅ Compte Auth créé:', cred.user.uid);

    const adminDoc = {
      email:     ADMIN_EMAIL,
      role:      'admin',
      firstName: ADMIN_FIRST,
      lastName:  ADMIN_LAST,
      avatar:    '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive:  true,
      permissions: ['manage_users', 'verify_experts', 'view_analytics', 'manage_proposals'],
    };

    await setDoc(doc(db, 'users', cred.user.uid), adminDoc);
    console.log('✅ Document Firestore créé');
    console.log('');
    console.log('🎉 Admin créé ! Connectez-vous sur /login');
    console.log(`   Email    : ${ADMIN_EMAIL}`);
    console.log(`   Password : ${ADMIN_PASSWORD}`);
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.error('❌ Email déjà utilisé. Essayez de mettre à jour le rôle manuellement dans Firestore.');
    } else {
      console.error('❌ Erreur:', err.message || err);
    }
  }

  process.exit(0);
}

seedAdmin();
