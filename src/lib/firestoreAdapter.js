import { getDb, getAdminStorage } from './firebaseAdmin.js';

function sanitizeForFirestore(val) {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirestore);
  }
  const clean = {};
  for (const [k, v] of Object.entries(val)) {
    clean[k] = v === undefined ? null : sanitizeForFirestore(v);
  }
  return clean;
}

export class FirestoreQueryBuilder {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filters = [];
    this.orders = [];
    this.limitCount = null;
    this.selectFields = '*';
    this.countOptions = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
    this.mutationType = null;
    this.mutationData = null;
  }

  select(fields = '*', options = null) {
    this.selectFields = fields;
    this.countOptions = options;
    return this;
  }

  eq(field, value) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  neq(field, value) {
    this.filters.push({ type: 'neq', field, value });
    return this;
  }

  in(field, values) {
    this.filters.push({ type: 'in', field, values: Array.isArray(values) ? values : [values] });
    return this;
  }

  ilike(field, pattern) {
    this.filters.push({ type: 'ilike', field, pattern });
    return this;
  }

  or(str) {
    this.filters.push({ type: 'or', str });
    return this;
  }

  order(field, { ascending = true } = {}) {
    this.orders.push({ field, ascending });
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(data) {
    this.mutationType = 'insert';
    this.mutationData = data;
    return this;
  }

  update(data) {
    this.mutationType = 'update';
    this.mutationData = data;
    return this;
  }

  delete() {
    this.mutationType = 'delete';
    return this;
  }

  async execute() {
    try {
      // getDb() sekarang async — await diperlukan
      const db = await getDb();
      if (!db) {
        throw new Error('Firestore database belum terhubung. Periksa serviceAccountKey.json atau kredensial Firebase.');
      }

      const col = db.collection(this.collectionName);

      // 1. Handle INSERT
      if (this.mutationType === 'insert') {
        const rows = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
        const results = [];
        const batch = db.batch();

        for (const row of rows) {
          const cleanRow = sanitizeForFirestore(row);
          const docId = cleanRow.id ? String(cleanRow.id) : col.doc().id;
          const docRef = col.doc(docId);
          const rowData = {
            ...cleanRow,
            id: docId,
            createdAt: cleanRow.createdAt || new Date().toISOString(),
            updatedAt: cleanRow.updatedAt || new Date().toISOString(),
          };
          batch.set(docRef, rowData, { merge: true });
          results.push(rowData);
        }
        await batch.commit();

        const returned = Array.isArray(this.mutationData) ? results : results[0];
        return { data: returned, error: null };
      }

      // 2. Fetch docs from Firestore
      const idFilter = this.filters.find((f) => f.type === 'eq' && f.field === 'id');
      let docs = [];

      if (idFilter && this.filters.length === 1 && !this.orders.length) {
        const directDoc = await col.doc(String(idFilter.value)).get();
        if (directDoc.exists) {
          docs = [{ id: directDoc.id, ...directDoc.data() }];
        }
      } else {
        const snapshot = await col.get();
        docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      // 3. Apply Filters
      for (const filter of this.filters) {
        if (filter.type === 'eq') {
          docs = docs.filter(
            (d) =>
              String(d[filter.field]) === String(filter.value) ||
              (filter.field === 'id' && String(d.id) === String(filter.value))
          );
        } else if (filter.type === 'neq') {
          docs = docs.filter((d) => String(d[filter.field]) !== String(filter.value));
        } else if (filter.type === 'in') {
          const set = new Set(filter.values.map((v) => String(v)));
          docs = docs.filter((d) => set.has(String(d[filter.field])));
        } else if (filter.type === 'ilike') {
          const term = String(filter.pattern).replace(/%/g, '').toLowerCase();
          docs = docs.filter((d) => String(d[filter.field] || '').toLowerCase().includes(term));
        } else if (filter.type === 'or') {
          const parts = filter.str.split(',').map((s) => s.trim());
          docs = docs.filter((d) => {
            return parts.some((part) => {
              const mIlike = part.match(/^([^.]+)\.ilike\.%?([^%]+)%?$/i);
              if (mIlike) {
                const [, field, val] = mIlike;
                return String(d[field] || '').toLowerCase().includes(val.toLowerCase());
              }
              const mEq = part.match(/^([^.]+)\.eq\.(.+)$/);
              if (mEq) {
                const [, field, val] = mEq;
                return (
                  String(d[field]) === String(val) ||
                  (field === 'id' && String(d.id) === String(val))
                );
              }
              const mNeq = part.match(/^([^.]+)\.neq\.(.+)$/);
              if (mNeq) {
                const [, field, val] = mNeq;
                return String(d[field]) !== String(val);
              }
              return false;
            });
          });
        }
      }

      // 4. Handle DELETE
      if (this.mutationType === 'delete') {
        const batch = db.batch();
        if (docs.length === 0 && idFilter) {
          batch.delete(col.doc(String(idFilter.value)));
          await batch.commit();
          return { data: null, error: null };
        }
        docs.forEach((d) => batch.delete(col.doc(d.id)));
        await batch.commit();
        return { data: null, error: null };
      }

      // 5. Handle UPDATE
      if (this.mutationType === 'update') {
        const batch = db.batch();
        const updated = [];
        const cleanUpdate = sanitizeForFirestore(this.mutationData);

        if (docs.length === 0 && idFilter) {
          const directDoc = await col.doc(String(idFilter.value)).get();
          if (directDoc.exists) {
            docs = [{ id: directDoc.id, ...directDoc.data() }];
          }
        }

        docs.forEach((d) => {
          const docRef = col.doc(d.id);
          const newDoc = {
            ...d,
            ...cleanUpdate,
            updatedAt: new Date().toISOString(),
          };
          batch.set(docRef, cleanUpdate, { merge: true });
          updated.push(newDoc);
        });
        await batch.commit();
        const returned = this.isSingle || this.isMaybeSingle ? updated[0] || null : updated;
        return { data: returned, error: null };
      }

      // 6. Handle Count
      if (this.countOptions && (this.countOptions.count === 'exact' || this.countOptions.head)) {
        return {
          count: docs.length,
          data: this.countOptions.head ? null : docs,
          error: null,
        };
      }

      // 7. Handle Sorting
      if (this.orders.length > 0) {
        docs.sort((a, b) => {
          for (const order of this.orders) {
            const valA = a[order.field];
            const valB = b[order.field];
            if (valA === valB) continue;
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;
            const res = valA > valB ? 1 : -1;
            return order.ascending ? res : -res;
          }
          return 0;
        });
      }

      // 8. Handle Limit
      if (this.limitCount !== null && this.limitCount !== undefined) {
        docs = docs.slice(0, this.limitCount);
      }

      // 9. Handle Relational Joins for Product and Category
      if (this.collectionName === 'Product' && typeof this.selectFields === 'string') {
        if (
          this.selectFields.includes('category:Category') ||
          this.selectFields.includes('images:ProductImage') ||
          this.selectFields.includes('variants:ProductVariant')
        ) {
          const [catSnap, imgSnap, varSnap] = await Promise.all([
            db.collection('Category').get(),
            db.collection('ProductImage').get(),
            db.collection('ProductVariant').get(),
          ]);
          const categories = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const images = imgSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const variants = varSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

          docs = docs.map((p) => {
            const cat = categories.find((c) => c.id === p.categoryId) || null;
            const pImgs = images
              .filter((img) => img.productId === p.id)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            const pVars = variants.filter((v) => v.productId === p.id);
            return {
              ...p,
              category: cat,
              images: pImgs,
              variants: pVars,
            };
          });
        }
      } else if (this.collectionName === 'Category' && typeof this.selectFields === 'string') {
        if (this.selectFields.includes('products:Product')) {
          const prodSnap = await db.collection('Product').get();
          const prods = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs = docs.map((c) => ({
            ...c,
            products: prods.filter((p) => p.categoryId === c.id).map((p) => ({ id: p.id })),
          }));
        }
      }

      // 10. Handle Single / MaybeSingle
      if (this.isSingle) {
        if (!docs[0]) return { data: null, error: new Error('Dokumen tidak ditemukan') };
        return { data: docs[0], error: null };
      }
      if (this.isMaybeSingle) {
        return { data: docs[0] || null, error: null };
      }

      return { data: docs, error: null };
    } catch (err) {
      console.error('FirestoreAdapter Error:', err);
      return { data: null, error: err };
    }
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

export const firestoreAdapter = {
  from(tableName) {
    return new FirestoreQueryBuilder(tableName);
  },
  storage: {
    from(bucketName) {
      return {
        async upload(filePath, fileBuffer, options = {}) {
          try {
            // getAdminStorage() sekarang async
            const adminStorage = await getAdminStorage();
            if (adminStorage) {
              const bucket = adminStorage.bucket();
              const destination = `${bucketName}/${filePath}`;
              const file = bucket.file(destination);
              await file.save(fileBuffer, {
                contentType: options.contentType || 'application/octet-stream',
                public: true,
              });
              return { data: { path: destination }, error: null };
            }
          } catch (e) {
            console.warn('Firebase Storage upload fallback:', e.message);
          }
          return { data: { path: filePath }, error: null };
        },
        getPublicUrl(filePath) {
          const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
          if (bucket) {
            return {
              data: {
                publicUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
                  `${bucketName}/${filePath}`
                )}?alt=media`,
              },
            };
          }
          return { data: { publicUrl: `/uploads/${bucketName}/${filePath}` } };
        },
      };
    },
  },
};
