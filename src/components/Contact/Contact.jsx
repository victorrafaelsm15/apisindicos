import { useForm } from 'react-hook-form';
import { Button, TextInput, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { MapPin, Mail } from 'lucide-react';
import { IconBrandInstagram, IconBrandWhatsapp } from '@tabler/icons-react';
import { siteInfo } from '../../data/siteContent';
import styles from './Contact.module.css';

const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(siteInfo.address)}&output=embed`;

function getWhatsappLink() {
  const digits = (siteInfo.whatsapp || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const whatsappLink = getWhatsappLink();

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    notifications.show({ title: 'Mensagem enviada', message: 'Obrigado pelo contato, retornaremos em breve.', color: 'blue' });
    reset();
  };

  return (
    <section className={`section ${styles.section}`} id="contato">
      <div className={`container ${styles.grid}`}>
        <div>
          <span className="eyebrow">Fale conosco</span>
          <h2 className={styles.title}>Quer saber mais sobre a APIS?</h2>
          <ul className={styles.infoList}>
            <li><MapPin size={18} /> {siteInfo.address}</li>
            <li><Mail size={18} /> {siteInfo.email}</li>
            <li><IconBrandInstagram size={18} /> {siteInfo.instagram}</li>
          </ul>

          <Button
            component="a"
            href={whatsappLink || undefined}
            target={whatsappLink ? '_blank' : undefined}
            rel="noreferrer"
            disabled={!whatsappLink}
            mt="lg"
            size="lg"
            radius="xl"
            color="green"
            leftSection={<IconBrandWhatsapp size={20} />}
          >
            {whatsappLink ? 'Falar no WhatsApp' : 'WhatsApp em breve'}
          </Button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <p className={styles.formHint}>Prefere e-mail? Envie sua mensagem por aqui.</p>
          <TextInput label="Nome" error={errors.name?.message} {...register('name', { required: 'Informe seu nome' })} />
          <TextInput label="E-mail" mt="md" error={errors.email?.message} {...register('email', { required: 'Informe seu e-mail' })} />
          <Textarea label="Mensagem" mt="md" minRows={4} error={errors.message?.message} {...register('message', { required: 'Escreva sua mensagem' })} />
          <Button type="submit" mt="lg" fullWidth radius="xl" color="blue.7" loading={isSubmitting}>Enviar mensagem</Button>
        </form>
      </div>

      <div className={`container ${styles.mapWrap}`}>
        <iframe
          title="Localização da APIS"
          src={MAPS_EMBED_SRC}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
