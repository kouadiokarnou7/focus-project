import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, taskName, dueDate } = body;

    if (!email || !taskName) {
      return NextResponse.json(
        { error: "Paramètres 'email' et 'taskName' requis." },
        { status: 400 }
      );
    }

    console.log(`[RAPPEL EMAIL SIMULÉ] Envoyé à: ${email}`);
    console.log(`Tâche: "${taskName}"`);
    console.log(`Date d'échéance: ${dueDate || "Non spécifiée"}`);

    // Ici, vous pourrez configurer votre propre fournisseur d'email.
    // Exemple avec Resend ou Nodemailer :
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'pomoBEAK <no-reply@pomobeak.com>',
      to: email,
      subject: `Rappel de tâche : ${taskName}`,
      html: `<p>Bonjour,</p><p>Ceci est un rappel pour votre tâche : <strong>${taskName}</strong> qui arrive à échéance le ${dueDate}.</p>`
    });
    */

    return NextResponse.json({
      success: true,
      message: `Rappel par e-mail simulé avec succès pour la tâche "${taskName}".`,
      data: {
        to: email,
        taskName,
        dueDate,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erreur lors du traitement du rappel : " + error.message },
      { status: 500 }
    );
  }
}
