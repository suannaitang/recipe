// 封装数据库操作api
let db = wx.cloud.database()
// 1.数据库添加
const _add = (collectionName, data = {}) => {
  // promise 对象
  return db.collection(collectionName).add({
    data
  })
}
// 2.通过id获取
const _findById = (collectionName,id="") => {
    return  db.collection(collectionName).doc(id).get();
}
// 3.获取全部
// 每一次请求，最多获取20条数据
const _findAll = async (collectionName,where ={},orderBy={field:"_id",sort:"desc"}) => {
  const MAX_LIMIT = 20  // 每次获取20条数据
  // 先取出集合记录总数
  const countResult = await db.collection(collectionName).count()
  const total = countResult.total  // 数据库一共有多少条数据
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  // [promise,promise,promise]
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(collectionName).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).orderBy(orderBy.field,orderBy.sort).get()
    tasks.push(promise)
  }
  // 判断 数据库是否存在数据
  if((await Promise.all(tasks)).length <=0){

    return null;
  }

  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data)
    }
  })
}

// 4.分页排序 limit   orderBy  page
const _find = (collectionName,where={},page=1,limit=4,orderBy={field:"_id",sort:"desc"}) => {
  // skip   跳过多少条
  // limit 每页显示多少条
  let skip = (page -1)*limit;
   return   db.collection(collectionName).where(where).skip(skip).limit(limit).orderBy(orderBy.field,orderBy.sort).get();
}

// 5.执行删除  通过id
const  _delById = (collectionName,id="")=>{
  return db.collection(collectionName).doc(id).remove()
}
// 6.根据id进行修改
const  _updateById = (collectionName,id="",data={})=>{
  return db.collection(collectionName).doc(id).update({
    data
  })
}

// 7.根据条件进行删除
const  _delByWhere = (collectionName,where={})=>{
  return   db.collection(collectionName).where(where).remove();
}
export default {
  _add,
  _findAll,
  _findById,
  _find,
  _delById,
  _updateById,
  db,
  _delByWhere
}