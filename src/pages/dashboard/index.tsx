import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Textarea from "@/src/components/textarea";
import { useState } from "react";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

const Dashboard = () => {
  const [task, setTask] = useState([]);

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

        <section className={styles.tasksContainer}>
          <h2>Minhas tarefas</h2>
          <article className={styles.task}>
            <div className={styles.tagContainer}>
              <label className={styles.tag}>Público</label>
              <button className={styles.shareButton}>
                <FiShare2 size={22} color="#3183ff" />
              </button>
            </div>

            <div className={styles.taskContent}>
              <p>Minha primeira tarefa</p>
              <button className={styles.trashButton}>
                <FaTrash size={24} color="#ea3140" />
              </button>
            </div>
          </article>
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
