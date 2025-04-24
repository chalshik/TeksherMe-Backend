import { getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { app } from "./config.js";

// Initialize Firestore
const db = getFirestore(app);

// Collection references
const categoriesRef = collection(db, "categories");
const questionPacksRef = collection(db, "questionPacks");

/**
 * Load all categories with pack counts
 */
export async function loadCategories() {
  try {
    const categoriesSnapshot = await getDocs(categoriesRef);
    const packsSnapshot = await getDocs(questionPacksRef);
    
    // Create a map of category ids to pack counts
    const packCountMap = {};
    packsSnapshot.forEach(packDoc => {
      const packData = packDoc.data();
      if (packData.categoryId) {
        if (!packCountMap[packData.categoryId]) {
          packCountMap[packData.categoryId] = 0;
        }
        packCountMap[packData.categoryId]++;
      }
    });
    
    // Map categories with pack counts
    const categories = categoriesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        questionPackCount: packCountMap[doc.id] || 0
      };
    });
    
    return categories;
  } catch (error) {
    console.error("Error loading categories:", error);
    throw error;
  }
}

/**
 * Get all categories
 */
export async function getAllCategories() {
  try {
    const categoriesSnapshot = await getDocs(categoriesRef);
    return categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
  } catch (error) {
    console.error("Error getting all categories:", error);
    throw error;
  }
}

/**
 * Add a new category
 */
export async function saveNewCategory(name) {
  try {
    const docRef = await addDoc(categoriesRef, {
      name: name
    });
    
    return {
      id: docRef.id,
      name: name,
      questionPackCount: 0
    };
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
}

/**
 * Update a category
 */
export async function updateCategory(categoryId, updatedData) {
  try {
    const categoryRef = doc(db, "categories", categoryId);
    await updateDoc(categoryRef, updatedData);
    
    // If we're updating the name, we need to update all question packs that use this category
    if (updatedData.name) {
      const packsSnapshot = await getDocs(
        query(questionPacksRef, where("categoryId", "==", categoryId))
      );
      
      // Update each pack with the new category name
      const updatePromises = packsSnapshot.docs.map(packDoc => {
        const packRef = doc(db, "questionPacks", packDoc.id);
        return updateDoc(packRef, { categoryName: updatedData.name });
      });
      
      await Promise.all(updatePromises);
    }
    
    return {
      id: categoryId,
      ...updatedData
    };
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

/**
 * Edit a category name
 */
export async function editCategory(categoryId, newName) {
  try {
    return await updateCategory(categoryId, { name: newName });
  } catch (error) {
    console.error("Error editing category:", error);
    throw error;
  }
}

/**
 * Delete a category and all associated question packs
 */
export async function deleteCategory(categoryId) {
  try {
    // First, get all question packs for this category
    const packsSnapshot = await getDocs(
      query(questionPacksRef, where("categoryId", "==", categoryId))
    );
    
    // Delete each pack
    const deletePromises = packsSnapshot.docs.map(packDoc => {
      const packRef = doc(db, "questionPacks", packDoc.id);
      return deleteDoc(packRef);
    });
    
    // Wait for all packs to be deleted
    await Promise.all(deletePromises);
    
    // Now delete the category
    const categoryRef = doc(db, "categories", categoryId);
    await deleteDoc(categoryRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

/**
 * Load all question packs summary
 */
export async function loadQuestionPacks() {
  try {
    const packsSnapshot = await getDocs(questionPacksRef);
    
    return packsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        time: data.time,
        difficulty: data.difficulty,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        questionCount: data.questions ? data.questions.length : 0
      };
    });
  } catch (error) {
    console.error("Error loading question packs:", error);
    throw error;
  }
}

/**
 * Get a question pack by ID
 */
export async function getQuestionPack(packId) {
  try {
    const packRef = doc(db, "questionPacks", packId);
    const packSnapshot = await getDoc(packRef);
    
    if (!packSnapshot.exists()) {
      return null;
    }
    
    const data = packSnapshot.data();
    return {
      id: packSnapshot.id,
      name: data.name,
      description: data.description,
      time: data.time,
      difficulty: data.difficulty,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      questions: data.questions || []
    };
  } catch (error) {
    console.error("Error getting question pack:", error);
    throw error;
  }
}

/**
 * Update an existing question pack
 */
export async function updateQuestionPack(packId, updatedData) {
  try {
    const packRef = doc(db, "questionPacks", packId);
    await updateDoc(packRef, updatedData);
    
    return {
      id: packId,
      ...updatedData
    };
  } catch (error) {
    console.error("Error updating question pack:", error);
    throw error;
  }
}

/**
 * Delete a question pack
 */
export async function deleteQuestionPack(packId) {
  try {
    const packRef = doc(db, "questionPacks", packId);
    await deleteDoc(packRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting question pack:", error);
    throw error;
  }
}

/**
 * Save a new question pack
 */
export async function saveQuestionPack(packData) {
  try {
    const docRef = await addDoc(questionPacksRef, packData);
    
    return {
      id: docRef.id,
      ...packData
    };
  } catch (error) {
    console.error("Error saving question pack:", error);
    throw error;
  }
}

/**
 * Add a question to a pack
 */
export async function addQuestionToPack(packId, question) {
  try {
    const pack = await getQuestionPack(packId);
    
    if (!pack) {
      throw new Error("Question pack not found");
    }
    
    const questions = pack.questions || [];
    questions.push(question);
    
    await updateQuestionPack(packId, { questions });
    
    return {
      id: packId,
      questions
    };
  } catch (error) {
    console.error("Error adding question to pack:", error);
    throw error;
  }
}

/**
 * Update a question in a pack
 */
export async function updateQuestionInPack(packId, questionIndex, updatedQuestion) {
  try {
    const pack = await getQuestionPack(packId);
    
    if (!pack) {
      throw new Error("Question pack not found");
    }
    
    if (!pack.questions || questionIndex >= pack.questions.length) {
      throw new Error("Question not found");
    }
    
    pack.questions[questionIndex] = updatedQuestion;
    
    await updateQuestionPack(packId, { questions: pack.questions });
    
    return {
      id: packId,
      questions: pack.questions
    };
  } catch (error) {
    console.error("Error updating question in pack:", error);
    throw error;
  }
}

/**
 * Delete a question from a pack
 */
export async function deleteQuestionFromPack(packId, questionIndex) {
  try {
    const pack = await getQuestionPack(packId);
    
    if (!pack) {
      throw new Error("Question pack not found");
    }
    
    if (!pack.questions || questionIndex >= pack.questions.length) {
      throw new Error("Question not found");
    }
    
    pack.questions.splice(questionIndex, 1);
    
    await updateQuestionPack(packId, { questions: pack.questions });
    
    return {
      id: packId,
      questions: pack.questions
    };
  } catch (error) {
    console.error("Error deleting question from pack:", error);
    throw error;
  }
}
