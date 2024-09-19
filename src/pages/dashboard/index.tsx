import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Textarea from "@/src/components/textarea";

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual a sua terefa?</h1>

            <form>
              <Textarea placeholder="Digite a sua tarefa..." />

              <div className={styles.checkboxArea}>
                <input type="checkbox" className={styles.checkbox} />
                <label>Deixar tarefa pública?</label>
              </div>

              <button type="submit" className={styles.button}>
                Registrar
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

// Função para verificar se  o usuário está logado
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  // Se não estiver logado, redireciona para a home
  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Dashboard;
