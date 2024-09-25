import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";

import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";

import { db } from "@/src/services/firebaseConnection";
import {
  collection,
  doc,
  where,
  query,
  getDoc,
  addDoc,
} from "firebase/firestore";
import Textarea from "@/src/components/textarea";

interface TaskProps {
  item: {
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
}

const Task = ({ item }: TaskProps) => {
  const [input, setInput] = useState("");
  const { data: session } = useSession();

  async function handleComment(e: FormEvent) {
    e.preventDefault();

    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comentario: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      });

      setInput("");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detallhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item?.tarefa}</p>
        </article>

        <section className={styles.commentsContainer}>
          <h2>Fazer comentário</h2>

          <form onSubmit={handleComment}>
            <Textarea
              placeholder="Digite seu comentário..."
              value={input}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setInput(e.target.value)
              }
            />

            <button
              className={styles.button}
              disabled={!session?.user}
              type="submit"
            >
              Enviar comentário
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

// No serverSide, busca os dados e trata (no objeto 'task') para devolver como prop pro componente
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tarefas", id);
  const snapshot = await getDoc(docRef);

  //    Redireciona o usuário para a home caso o id pesquisado seja undefined
  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  //    Redireciona o usuário para a home caso o id pesquisado não seja público
  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    tarefa: snapshot.data()?.tarefa,
    created: new Date(miliseconds).toLocaleString(),
    public: snapshot.data()?.public,
    user: snapshot.data()?.user,
    taskId: id,
  };

  return {
    props: {
      item: task,
    },
  };
};

export default Task;
