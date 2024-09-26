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
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import Textarea from "@/src/components/textarea";
import { FaTrash } from "react-icons/fa";

interface TaskProps {
  item: {
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
  allComments: CommentsProps[];
}

interface CommentsProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

const Task = ({ item, allComments }: TaskProps) => {
  const [input, setInput] = useState("");
  const { data: session } = useSession();

  const [comments, setComments] = useState<CommentsProps[]>(allComments || []);

  //   Registrar comentário
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

      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      };

      setComments((oldItems) => [...oldItems, data]);

      setInput("");
    } catch (error) {
      console.log(error);
    }
  }

  // Deletar comentário
  async function handleDelete(id: string) {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);

      const remainingComments = comments.filter((item) => item.id !== id)
      setComments(remainingComments)
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

        <section className={styles.commentsContainer}>
          <h2>Todos os comentários</h2>

          <article>
            {comments.length === 0 && <span>Nenhum comentário</span>}

            {comments.map((item) => (
              <article key={item.id} className={styles.comment}>
                <div className={styles.box}>
                  <label className={styles.name}>{item.name}</label>
                  {item.user === session?.user?.email && (
                    <button
                      className={styles.trashButton}
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash size={14} color="#ea3140" />
                    </button>
                  )}
                </div>
                <p>{item.comment}</p>
              </article>
            ))}
          </article>
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

  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapshotComments = await getDocs(q);

  const allComments: CommentsProps[] = [];
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      taskId: doc.data().taskId,
      user: doc.data().user,
      comment: doc.data().comentario,
      name: doc.data().name,
    });
  });

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
      allComments: allComments,
    },
  };
};

export default Task;
