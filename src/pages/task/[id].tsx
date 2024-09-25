import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";

import { db } from "@/src/services/firebaseConnection";
import { collection, doc, where, query, getDoc } from "firebase/firestore";

const Task = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Detallhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
      </main>
    </div>
  );
};

// No serverSide, busca os dados e trata (no objeto 'task') para devolver como prop pro componente
const getserverSideProps: GetServerSideProps = async ({ params }) => {
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
    props: {},
  };
};

export default Task;
