import { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Select, Button, FileInput, Checkbox, SimpleGrid, Alert, Loader, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, CircleDollarSign, Paperclip } from 'lucide-react';
import PageHeader from '../components/PageHeader/PageHeader';
import { ANEXO_RULES, validateAnexo, submitFiliacao } from '../lib/filiacao';
import {
  affiliationText,
  affiliationWhyJoin,
  membershipRequirements,
  memberRights,
  memberDuties,
} from '../data/siteContent';
import styles from './Filiacao.module.css';

const CATEGORY_OPTIONS = ['Síndico Profissional', 'Síndico Orgânico'];

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const TERMO_ADESAO_ITENS = [
  'Os direitos dos associados são LIMITADOS à utilização dos serviços e benefícios disponibilizados pela APIS e previstos em Estatuto ou resultantes de contratos ou convênios que sejam regularmente firmados com a APIS.',
  'O associado tem ciência de que deve seguir e cumprir as determinações do Estatuto Social da APIS e demais determinações devidamente formalizadas.',
  'O associado tem ciência de que a associação irá consultar as certidões negativas cível e criminal das Justiças Estadual e Federal. A certidão positiva cível da pessoa física e jurídica será aceita, desde que não seja relacionada à área condominial. A certidão positiva criminal da pessoa física e jurídica não será aceita sobre qualquer natureza criminal (processos transitados em julgado).',
  'Estou ciente de que minha filiação somente terá validade após análise e aprovação do Diretor Administrativo. Caso não seja aceita, poderei interpor recurso à Diretoria Executiva da APIS, que irá pautar o tema para deliberação em Assembleia Geral Extraordinária.',
];

const DEFAULT_VALUES = {
  nome_completo: '',
  cpf_cnpj: '',
  email: '',
  telefone: '',
  data_nascimento: '',
  estado_civil: '',
  endereco: '',
  bairro: '',
  cidade: '',
  cep: '',
  estado: 'PI',
  condominio: '',
  categoria: null,
  doc_identidade: null,
  ata_eleicao: null,
  termo_adesao: false,
  declaracao_veracidade: false,
};

function maskCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function validateBirthDate(value) {
  if (!value) return 'Informe a data de nascimento';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01') return 'Data de nascimento inválida';
  if (value > todayIso()) return 'A data de nascimento não pode estar no futuro';
  return true;
}

// Ícone do checkbox com aparência de radio (círculo com ponto central).
function RadioDot({ className }) {
  return <span className={`${className} ${styles.radioDot}`} />;
}

export default function Filiacao() {
  const {
    register, control, handleSubmit, reset, setValue, getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ mode: 'onTouched', defaultValues: DEFAULT_VALUES });

  const [cepStatus, setCepStatus] = useState(null); // null | 'loading' | 'notfound'
  const [success, setSuccess] = useState(false);
  const successRef = useRef(null);
  // Último logradouro preenchido pelo ViaCEP: o endereço só é sobrescrito
  // se a pessoa ainda não o tiver editado manualmente.
  const autoEndereco = useRef('');

  const lookupCep = async (cep) => {
    const digits = cep.replace(/\D/g, '');
    setCepStatus('loading');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      // Ignora respostas atrasadas se o CEP já foi alterado.
      if (getValues('cep').replace(/\D/g, '') !== digits) return;
      if (!res.ok || data.erro) { setCepStatus('notfound'); return; }
      const opts = { shouldValidate: true, shouldDirty: true };
      const currentEndereco = getValues('endereco');
      if (data.logradouro && (!currentEndereco || currentEndereco === autoEndereco.current)) {
        const filled = `${data.logradouro}, `;
        autoEndereco.current = filled;
        setValue('endereco', filled, opts);
      }
      if (data.bairro) setValue('bairro', data.bairro, opts);
      if (data.localidade) setValue('cidade', data.localidade, opts);
      if (UFS.includes(data.uf)) setValue('estado', data.uf, opts);
      setCepStatus(null);
    } catch {
      // ViaCEP indisponível: o preenchimento manual continua funcionando.
      setCepStatus(null);
    }
  };

  const onSubmit = async ({ termo_adesao, declaracao_veracidade, ...values }) => {
    setSuccess(false);
    try {
      await submitFiliacao({
        ...values,
        termo_adesao_aceito: termo_adesao,
        declaracao_veracidade_aceita: declaracao_veracidade,
        termos_aceitos_em: new Date().toISOString(),
      });
      reset(DEFAULT_VALUES);
      autoEndereco.current = '';
      setCepStatus(null);
      setSuccess(true);
      notifications.show({ title: 'Solicitação enviada', message: 'Recebemos seu pedido de associação. Em breve entraremos em contato.', color: 'blue' });
      requestAnimationFrame(() => successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    } catch {
      notifications.show({ title: 'Erro ao enviar', message: 'Não foi possível registrar sua solicitação. Verifique sua conexão e tente novamente.', color: 'red' });
    }
  };

  const renderAnexo = (name) => {
    const rule = ANEXO_RULES[name];
    return (
      <Controller
        name={name}
        control={control}
        rules={{ validate: (file) => validateAnexo(name, file) }}
        render={({ field, fieldState }) => (
          <FileInput
            label={rule.label}
            withAsterisk
            mt="md"
            placeholder="Selecionar arquivo…"
            description={`${rule.formatsLabel}, até ${rule.maxBytes / (1024 * 1024)} MB. Para trocar, clique no campo e escolha outro arquivo.`}
            accept={rule.accept}
            leftSection={<Paperclip size={15} />}
            clearable
            ref={field.ref}
            value={field.value}
            onChange={(file) => { field.onChange(file); field.onBlur(); }}
            error={fieldState.error?.message}
          />
        )}
      />
    );
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

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <h3>Ficha de inscrição</h3>
            <Text size="xs" c="dimmed" mt={4}>Campos marcados com * são obrigatórios.</Text>
            {success && (
              <Alert
                ref={successRef}
                mt="md"
                color="blue"
                radius="md"
                title="Solicitação enviada com sucesso!"
                icon={<CheckCircle2 size={18} />}
                withCloseButton
                onClose={() => setSuccess(false)}
              >
                Recebemos sua ficha de inscrição e os documentos anexados. Sua filiação será analisada
                pela Diretoria Administrativa e entraremos em contato pelo e-mail ou telefone informado.
              </Alert>
            )}
            <TextInput
              label="Nome completo"
              withAsterisk
              mt="md"
              error={errors.nome_completo?.message}
              {...register('nome_completo', { required: 'Informe o nome completo' })}
            />
            <TextInput
              label="CPF ou CNPJ"
              withAsterisk
              mt="md"
              error={errors.cpf_cnpj?.message}
              {...register('cpf_cnpj', { required: 'Informe o CPF ou CNPJ' })}
            />
            <TextInput
              label="E-mail"
              type="email"
              withAsterisk
              mt="md"
              error={errors.email?.message}
              {...register('email', {
                required: 'Informe o e-mail',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Informe um e-mail válido' },
              })}
            />
            <TextInput
              label="Telefone"
              type="tel"
              withAsterisk
              mt="md"
              error={errors.telefone?.message}
              {...register('telefone', { required: 'Informe o telefone' })}
            />
            <TextInput
              label="Data de nascimento"
              type="date"
              lang="pt-BR"
              withAsterisk
              mt="md"
              min="1900-01-01"
              max={todayIso()}
              error={errors.data_nascimento?.message}
              {...register('data_nascimento', { validate: validateBirthDate })}
            />
            <TextInput
              label="Estado civil"
              placeholder="Ex.: Casado(a)"
              withAsterisk
              mt="md"
              error={errors.estado_civil?.message}
              {...register('estado_civil', { required: 'Informe o estado civil' })}
            />
            <TextInput
              label="Endereço"
              placeholder="Rua e número"
              withAsterisk
              mt="md"
              autoComplete="street-address"
              error={errors.endereco?.message}
              {...register('endereco', { required: 'Informe o endereço (rua e número)' })}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing={0}>
              <TextInput
                label="Bairro"
                withAsterisk
                mt="md"
                error={errors.bairro?.message}
                {...register('bairro', { required: 'Informe o bairro' })}
              />
              <TextInput
                label="Cidade"
                withAsterisk
                mt="md"
                error={errors.cidade?.message}
                {...register('cidade', { required: 'Informe a cidade' })}
              />
              <Controller
                name="cep"
                control={control}
                rules={{
                  required: 'Informe o CEP',
                  pattern: { value: /^\d{5}-\d{3}$/, message: 'CEP inválido. Use o formato 00000-000' },
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="CEP"
                    placeholder="00000-000"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    withAsterisk
                    mt="md"
                    ref={field.ref}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      const masked = maskCep(e.currentTarget.value);
                      field.onChange(masked);
                      if (masked.length === 9) lookupCep(masked); else setCepStatus(null);
                    }}
                    rightSection={cepStatus === 'loading' ? <Loader size={14} /> : null}
                    description={cepStatus === 'notfound' ? 'CEP não encontrado. Preencha o endereço manualmente.' : null}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="estado"
                control={control}
                rules={{ required: 'Selecione o estado' }}
                render={({ field, fieldState }) => (
                  <Select
                    label="Estado"
                    withAsterisk
                    mt="md"
                    data={UFS}
                    searchable
                    allowDeselect={false}
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </SimpleGrid>
            <TextInput
              label="Condomínio (opcional)"
              mt="md"
              {...register('condominio')}
            />
            <Controller
              name="categoria"
              control={control}
              rules={{ required: 'Selecione a categoria' }}
              render={({ field, fieldState }) => (
                <Select
                  label="Categoria"
                  placeholder="Selecione a categoria"
                  withAsterisk
                  mt="md"
                  data={CATEGORY_OPTIONS}
                  ref={field.ref}
                  value={field.value}
                  onChange={(v) => { field.onChange(v); field.onBlur(); }}
                  onBlur={field.onBlur}
                  allowDeselect={false}
                  error={fieldState.error?.message}
                />
              )}
            />

            {renderAnexo('doc_identidade')}
            {renderAnexo('ata_eleicao')}

            <div className={styles.terms}>
              <Controller
                name="termo_adesao"
                control={control}
                rules={{ validate: (v) => v || 'É necessário aceitar o termo de adesão' }}
                render={({ field, fieldState }) => (
                  <>
                    <Checkbox
                      radius="xl"
                      size="md"
                      icon={RadioDot}
                      ref={field.ref}
                      checked={field.value}
                      onChange={(e) => { field.onChange(e.currentTarget.checked); field.onBlur(); }}
                      classNames={{ body: styles.termsBody, label: styles.termsLabel }}
                      label={<strong>Solicito minha associação à APIS na categoria de Associado Síndico (profissional ou orgânico), estando ciente de que:</strong>}
                    />
                    <div className={styles.termsDetails}>
                      <ol className={styles.termsList}>
                        {TERMO_ADESAO_ITENS.map((t) => <li key={t}>{t}</li>)}
                      </ol>
                      {fieldState.error && <Text size="xs" c="red" mt={6}>{fieldState.error.message}</Text>}
                    </div>
                  </>
                )}
              />
              <Controller
                name="declaracao_veracidade"
                control={control}
                rules={{ validate: (v) => v || 'É necessário aceitar a declaração' }}
                render={({ field, fieldState }) => (
                  <Checkbox
                    radius="xl"
                    size="md"
                    mt="lg"
                    icon={RadioDot}
                    ref={field.ref}
                    checked={field.value}
                    onChange={(e) => { field.onChange(e.currentTarget.checked); field.onBlur(); }}
                    classNames={{ body: styles.termsBody, label: styles.termsLabel }}
                    label="Pelo presente termo, sob minha inteira responsabilidade, declaro verdadeiras todas as informações prestadas nesta Ficha Cadastral. Por ser a expressão da verdade e da minha vontade, firmo o presente."
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <Button
              type="submit"
              mt="lg"
              fullWidth
              radius="xl"
              color="blue.7"
              loading={isSubmitting}
              disabled={!isValid}
            >
              Enviar solicitação
            </Button>
            {!isValid && !isSubmitting && (
              <Text size="xs" c="dimmed" ta="center" mt={8}>
                Preencha todos os campos obrigatórios, anexe os dois documentos e marque os dois termos para enviar.
              </Text>
            )}
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
