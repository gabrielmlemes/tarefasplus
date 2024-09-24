import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Textarea from "@/src/components/textarea";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

import { db } from "@/src/services/firebaseConnection";
import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Link from "next/link";

interface DashboardProps {
  user: {
    email: string;
  };
}

const Dashboard = ({ user }: DashboardProps) => {
  const [input, setIput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  interface TaskProps {
    id: string;
    create: Date;
    public: boolean;
    tarefa: string;
    user: string;
  }

  // Assim que abre o componente, busca as tarefas no banco e seta no state 'tasks'
  useEffect(() => {
    async function loadTasks() {
      const taskRef = collection(db, "tarefas");
      const queryRef = query(
        taskRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      );

      // (onSnapshot "monitora" em tempo real as modificações no banco)
      onSnapshot(queryRef, (snapshot) => {
        let tasksList = [] as TaskProps[];

        snapshot.forEach((doc) => {
          tasksList.push({
            id: doc.id,
            create: doc.data().created,
            public: doc.data().public,
            tarefa: doc.data().tarefa,
            user: doc.data().user,
          });
        });

        setTasks(tasksList);
      });
    }

    loadTasks();
  }, [user?.email]);

  // Verifica se o input está 'checked' e seta no state 'publicTask'
  function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
    setPublicTask(e.target.checked);
  }

  // Cadastra dados no banco
  async function handleRegisterTask(e: FormEvent) {
    e.preventDefault();

    if (input === "") {
      return;
    }

    try {
      await addDoc(collection(db, "tarefas"), {
        tarefa: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });

      setIput("");
      setPublicTask(false);
    } catch (err) {
      console.log(err);
    }
  }

  // Compartilhar task
  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    );

    alert("url copiada com sucesso");
  }

  // Deletar task
  async function handleDelete(id: string) {

    const docRef = doc(db, "tarefas", id);
    await deleteDoc(docRef);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual a sua terefa?</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Digite a sua tarefa..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setIput(e.target.value)
                }
              />

              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
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
          {tasks.map((task) => (
            <article className={styles.task} key={task.id}>
              {task.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>Público</label>
                  <button
                    className={styles.shareButton}
                    onClick={() => handleShare(task.id)}
                  >
                    <FiShare2 size={22} color="#3183ff" />
                  </button>
                </div>
              )}

              <div className={styles.taskContent}>
                {task.public ? (
                  <Link href={`/task/${task.id}`}>
                    <p>{task.tarefa}</p>
                  </Link>
                ) : (
                  <p>{task.tarefa}</p>
                )}
                <button
                  className={styles.trashButton}
                  onClick={() => handleDelete(task.id)}
                >
                  <FaTrash size={24} color="#ea3140" />
                </button>
              </div>
            </article>
          ))}
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

  // retorna dados do usuário para o componente
  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};

export default Dashboard;
