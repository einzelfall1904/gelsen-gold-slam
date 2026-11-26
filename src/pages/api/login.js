import { passwortRichtig, anmelden, abmelden } from '../../lib/auth.js';

export const POST = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  if (form.get('aktion') === 'abmelden') { abmelden(cookies); return redirect('/admin', 303); }
  if (passwortRichtig(form.get('passwort'))) { anmelden(cookies); return redirect('/admin', 303); }
  return redirect('/admin?fehler=1', 303);
};
