import rootRender from '../../index.js'

let db;

/* IndexedDB에 저장된 데이터를 불러오는 함수 */
function loadIndexedDB() {
  const transaction = db.transaction(['task', 'tagList']);
  const taskObjectStore = transaction.objectStore('task'); // A. Task 가져오기
  const taskFetchRequest = taskObjectStore.getAll();
  const tagObjectStore = transaction.objectStore('tagList'); // B. 태그 리스트 목록 가져오기
  const tagFetchRequest = tagObjectStore.getAll();

  taskFetchRequest.onsuccess = () => { // C-1. "Task" ObjectStore 로드 후 작업
    console.time("Configure Task Nodes");

    rootRender(taskFetchRequest.result);
    console.timeEnd("Configure Task Nodes");
  };

  /* tagFetchRequest.onsuccess = () => { // C-2. "TagList" ObjectStore 로드 후 작업
    const tagList = document.querySelector('.tag-list');
    const tagArray = tagFetchRequest.result.map((el) => el.tag);

    configureTagNode(tagList, tagArray, { makeCheckbox: true, fetchDB: false });
  }; */
}

/* Task 데이터 저장에 indexedDB 이용 */
const dbRequest = indexedDB.open('user-Todo', 1);

dbRequest.onupgradeneeded = () => {
  db = dbRequest.result;

  // "task" Object Store 생성
  const taskObjectStore = db.createObjectStore('task', { keyPath: 'id' });
  db.createObjectStore('tagList', { keyPath: 'tag' });

  // Index 생성
  taskObjectStore.createIndex('title', 'title', { unique: false });
  taskObjectStore.createIndex('isCompleted', 'isCompleted', { unique: false });
  taskObjectStore.createIndex('dueDate', 'dueDate', { unique: false });
  taskObjectStore.createIndex('tags', 'tags', { unique: false });
};

dbRequest.onsuccess = () => {
  db = dbRequest.result;

  loadIndexedDB();
};

dbRequest.onerror = () => { };

export { db }; 