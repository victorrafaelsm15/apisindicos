import { useForm, Controller } from 'react-hook-form';
import { TextInput, Select, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, CircleDollarSign } from 'lucide-react';
import PageHeader from '../components/PageHeader/PageHeader';
import { filiacaoStore } from '../lib/stores';
import {
  affiliationText,
  affiliationWhyJoin,
  membershipRequirements,
  memberRights,
  memberDuties,
} from '../data/siteContent';
import styles from './Filiacao.module.css';

const CATEGORY_OPTIONS = ['Associado Individual', 'Associado Benemérito'];

export default function Filiacao() {
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { categoria: CATEGORY_OPTIONS[0] },
  });

  const onSubmit = async (values) => {
    try {
      await filiacaoStore.create({ ...values, status: 'pendente' });
      notifications.show({ title: 'Solicitação enviada', message: 'Recebemos seu pedido de associação. Em breve entraremos em contato.', color: 'blue' });
      reset({ categoria: CATEGORY_OPTIONS[0] });
    } catch {
      notifications.show({ title: 'Erro ao enviar', message: 'Não foi possível registrar sua solicitação. Tente novamente.', color: 'red' });
    }
  };

  return (
    <>
      <PageHeader
        title="Associe-se"
        subtitle="Faça parte de uma associação sólida, com representação institucional em todo o Piauí."
      />

      <section className={`section ${styles.section}`}>
        <div className="container">
          <p className={styles.intro}>{affiliationText}</p>
          <div className={styles.priceBadgeWrap}>
            <div className={styles.priceBadge}>
              <CircleDollarSign size={30} />
              <div>
                <strong>R$ 60,00</strong>
                <span>contribuição mensal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.section} ${styles.sectionTight}`}>
        <div className="container">
          <div className={styles.card}>
            <h3>Documentos necessários</h3>
            <ul className={styles.checkList}>
              {membershipRequirements.map((r) => (
                <li key={r}><CheckCircle2 size={16} /> {r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={`section ${styles.section}`}>
        <div className={`container ${styles.formGrid}`}>
          <div className={styles.card}>
            <h3>Por que se associar?</h3>
            <ul className={styles.checkList}>
              {affiliationWhyJoin.map((r) => (
                <li key={r}><CheckCircle2 size={16} /> {r}</li>
              ))}
            </ul>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <h3>Ficha de inscrição</h3>
            <TextInput
              label="Nome completo"
              mt="md"
              error={errors.nome_completo?.message}
              {...register('nome_completo', { required: 'Informe o nome completo' })}
            />
            <TextInput
              label="CPF ou CNPJ"
              mt="md"
              error={errors.cpf_cnpj?.message}
              {...register('cpf_cnpj', { required: 'Informe o CPF ou CNPJ' })}
            />
            <TextInput
              label="E-mail"
              mt="md"
              error={errors.email?.message}
              {...register('email', { required: 'Informe o e-mail' })}
            />
            <TextInput
              label="Telefone"
              mt="md"
              error={errors.telefone?.message}
              {...register('telefone', { required: 'Informe o telefone' })}
            />
            <TextInput
              label="Condomínio (opcional)"
              mt="md"
              {...register('condominio')}
            />
            <Controller
              name="categoria"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  label="Categoria"
                  mt="md"
                  data={CATEGORY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  allowDeselect={false}
                />
              )}
            />
            <Button type="submit" mt="lg" fullWidth radius="xl" color="blue.7" loading={isSubmitting}>
              Enviar solicitação
            </Button>
          </form>
        </div>
      </section>

      <section className={`section ${styles.section} ${styles.sectionTight}`}>
        <div className="container">
          <div className={styles.header}>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px,3vw,32px)', margin: '0 0 8px' }}>
              Direitos e Deveres do Associado
            </h2>
            <p className="section-sub">Conforme o Estatuto Social da APIS — Art. 6º e Art. 7º.</p>
          </div>
          <div className={styles.rightsGrid}>
            <div className={styles.card}>
              <h3>Direitos</h3>
              <ul className={styles.checkList}>
                {memberRights.map((r) => (
                  <li key={r}><CheckCircle2 size={16} /> {r}</li>
                ))}
              </ul>
            </div>
            <div className={styles.card}>
              <h3>Deveres</h3>
              <ul className={styles.checkList}>
                {memberDuties.map((r) => (
                  <li key={r}><CheckCircle2 size={16} /> {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
