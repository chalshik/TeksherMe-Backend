import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  setDoc,
  serverTimestamp,
  orderBy,
  increment
} from "firebase/firestore";
import { app } from "./config.js";

// Initialize Firestore
const db = getFirestore(app);

// Collection references
const categoriesRef = collection(db, "categories");
const questionPacksRef = collection(db, "question_packs");
const commercialsRef = collection(db, "commercials");

/**
 * Load all categories with pack counts
 */
export async function loadCategories() {
  try {
    const categoriesSnapshot = await getDocs(categoriesRef);
    const packCountMap = {};
    
    // Query each pack to count by category
    const packsSnapshot = await getDocs(questionPacksRef);
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
        packCount: packCountMap[doc.id] || 0, // Use packCount for backward compatibility
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
      name: name,
      createdAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      name: name,
      packCount: 0,
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
    
    if (typeof updatedData === 'string') {
      // If just a string is passed, assume it's the name
      updatedData = { name: updatedData };
    }
    
    // Add timestamp
    updatedData.updatedAt = serverTimestamp();
    
    await updateDoc(categoryRef, updatedData);
    
    // If we're updating the name, we need to update all question packs that use this category
    if (updatedData.name) {
      const packsSnapshot = await getDocs(
        query(questionPacksRef, where("categoryId", "==", categoryId))
      );
      
      // Update each pack with the new category name
      const updatePromises = packsSnapshot.docs.map(packDoc => {
        const packRef = doc(db, "question_packs", packDoc.id);
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
      return deleteQuestionPack(packDoc.id);
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
    const packsList = [];
    
    for (const packDoc of packsSnapshot.docs) {
      const packData = packDoc.data();
      const packId = packDoc.id;
      
      // Count questions in the subcollection
      const questionsRef = collection(db, "question_packs", packId, "questions");
      const questionsSnapshot = await getDocs(questionsRef);
      const questionCount = questionsSnapshot.size;
      
      packsList.push({
        id: packId,
        name: packData.name || '',
        description: packData.description || '',
        time: packData.time || 10,
        difficulty: packData.difficulty || 'easy',
        categoryId: packData.categoryId || '',
        categoryName: packData.categoryName || '',
        questionCount: questionCount,
        questions: [] // Include empty array for compatibility
      });
    }
    
    return packsList;
  } catch (error) {
    console.error("Error loading question packs:", error);
    throw error;
  }
}

/**
 * Get a question pack by ID with all questions and options
 */
export async function getQuestionPack(packId) {
  try {
    const packRef = doc(db, "question_packs", packId);
    const packSnapshot = await getDoc(packRef);
    
    if (!packSnapshot.exists()) {
      return null;
    }
    
    const packData = packSnapshot.data();
    
    // Get all questions for this pack
    const questionsRef = collection(db, "question_packs", packId, "questions");
    const questionsQuery = query(questionsRef, orderBy("order", "asc"));
    const questionsSnapshot = await getDocs(questionsQuery);
    
    const questions = [];
    
    // For each question, get its options
    for (const questionDoc of questionsSnapshot.docs) {
      const questionData = questionDoc.data();
      const questionId = questionDoc.id;
      
      // Get options for this question
      const optionsRef = collection(
        db, 
        "question_packs", 
        packId, 
        "questions", 
        questionId, 
        "options"
      );
      const optionsQuery = query(optionsRef, orderBy("order", "asc"));
      const optionsSnapshot = await getDocs(optionsQuery);
      
      const options = optionsSnapshot.docs.map(optionDoc => {
        const optionData = optionDoc.data();
        return {
          id: optionDoc.id,
          text: optionData.text || '',
          isCorrect: Boolean(optionData.isCorrect)
        };
      });
      
      questions.push({
        id: questionId,
        text: questionData.text || '',
        options: options
      });
    }
    
    return {
      id: packSnapshot.id,
      name: packData.name || '',
      description: packData.description || '',
      time: packData.time || 10,
      difficulty: packData.difficulty || 'easy',
      categoryId: packData.categoryId || '',
      categoryName: packData.categoryName || '',
      questions: questions
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
    const packRef = doc(db, "question_packs", packId);
    
    // Extract questions from updatedData before updating the pack document
    const questions = updatedData.questions || [];
    
    // Clone updatedData without the questions field
    const packDataToUpdate = {...updatedData};
    delete packDataToUpdate.questions;
    
    // Add updatedAt timestamp
    packDataToUpdate.updatedAt = serverTimestamp();
    
    // Sanitize the data
    const sanitizedData = {};
    
    if (packDataToUpdate.name !== undefined) sanitizedData.name = String(packDataToUpdate.name);
    if (packDataToUpdate.description !== undefined) sanitizedData.description = String(packDataToUpdate.description);
    if (packDataToUpdate.time !== undefined) sanitizedData.time = Number(packDataToUpdate.time) || 10;
    if (packDataToUpdate.difficulty !== undefined) sanitizedData.difficulty = String(packDataToUpdate.difficulty);
    if (packDataToUpdate.categoryId !== undefined) sanitizedData.categoryId = String(packDataToUpdate.categoryId);
    if (packDataToUpdate.categoryName !== undefined) sanitizedData.categoryName = String(packDataToUpdate.categoryName);
    if (packDataToUpdate.updatedAt !== undefined) sanitizedData.updatedAt = packDataToUpdate.updatedAt;
    
    // Update the pack document
    await updateDoc(packRef, sanitizedData);
    
    // If there are questions to update
    if (Array.isArray(questions) && questions.length > 0) {
      // Delete all existing questions and their options first
      await deleteAllQuestionsInPack(packId);
      
      // Add the new questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await addQuestionToPack(packId, question, i);
      }
    }
    
    return {
      id: packId,
      ...sanitizedData,
      questions: questions
    };
  } catch (error) {
    console.error("Error updating question pack:", error);
    throw error;
  }
}

/**
 * Delete all questions in a pack
 */
async function deleteAllQuestionsInPack(packId) {
  try {
    const questionsRef = collection(db, "question_packs", packId, "questions");
    const questionsSnapshot = await getDocs(questionsRef);
    
    // Delete each question and its options
    for (const questionDoc of questionsSnapshot.docs) {
      const questionId = questionDoc.id;
      
      // Delete all options for this question
      const optionsRef = collection(
        db, 
        "question_packs", 
        packId, 
        "questions", 
        questionId, 
        "options"
      );
      const optionsSnapshot = await getDocs(optionsRef);
      
      for (const optionDoc of optionsSnapshot.docs) {
        await deleteDoc(doc(
          db, 
          "question_packs", 
          packId, 
          "questions", 
          questionId, 
          "options", 
          optionDoc.id
        ));
      }
      
      // Delete the question
      await deleteDoc(doc(db, "question_packs", packId, "questions", questionId));
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting all questions in pack:", error);
    throw error;
  }
}

/**
 * Delete a question pack and all its questions and options
 */
export async function deleteQuestionPack(packId) {
  try {
    // First delete all questions and options
    await deleteAllQuestionsInPack(packId);
    
    // Then delete the pack itself
    const packRef = doc(db, "question_packs", packId);
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
    // Extract questions from packData
    const questions = packData.questions || [];
    
    // Clone packData without the questions field
    const packDataToSave = {...packData};
    delete packDataToSave.questions;
    
    // Add timestamps
    packDataToSave.createdAt = serverTimestamp();
    packDataToSave.updatedAt = serverTimestamp();
    
    // Sanitize pack data
    const sanitizedData = {
      name: packDataToSave.name || '',
      description: packDataToSave.description || '',
      time: Number(packDataToSave.time) || 10,
      difficulty: packDataToSave.difficulty || 'easy',
      categoryId: packDataToSave.categoryId || '',
      categoryName: packDataToSave.categoryName || '',
      createdAt: packDataToSave.createdAt,
      updatedAt: packDataToSave.updatedAt
    };
    
    // Create the question pack document
    const docRef = await addDoc(questionPacksRef, sanitizedData);
    const packId = docRef.id;
    
    // Add questions as subcollection documents
    if (Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await addQuestionToPack(packId, question, i);
      }
    }
    
    return {
      id: packId,
      ...sanitizedData,
      questions: questions
    };
  } catch (error) {
    console.error("Error saving question pack:", error);
    throw error;
  }
}

/**
 * Add a question to a pack
 */
export async function addQuestionToPack(packId, question, order = 0) {
  try {
    const questionsRef = collection(db, "question_packs", packId, "questions");
    
    // Sanitize question data
    const sanitizedQuestion = {
      text: question.text || '',
      order: order,
      createdAt: serverTimestamp()
    };
    
    // Create the question document
    const questionDocRef = await addDoc(questionsRef, sanitizedQuestion);
    const questionId = questionDocRef.id;
    
    // Add options as subcollection documents
    if (Array.isArray(question.options) && question.options.length > 0) {
      const optionsRef = collection(
        db, 
        "question_packs", 
        packId, 
        "questions", 
        questionId, 
        "options"
      );
      
      for (let i = 0; i < question.options.length; i++) {
        const option = question.options[i];
        
        // Skip empty options
        if (!option.text.trim()) continue;
        
        // Sanitize option data
        const sanitizedOption = {
          text: option.text || '',
          isCorrect: Boolean(option.isCorrect),
          order: i,
          createdAt: serverTimestamp()
        };
        
        await addDoc(optionsRef, sanitizedOption);
      }
    }
    
    // Update question count in the pack document
    const packRef = doc(db, "question_packs", packId);
    await updateDoc(packRef, {
      questionCount: increment(1)
    });
    
    return {
      id: questionId,
      text: sanitizedQuestion.text,
      options: question.options || []
    };
  } catch (error) {
    console.error("Error adding question to pack:", error);
    throw error;
  }
}

/**
 * Get all questions from a pack
 */
export const getPackQuestions = async (packId) => {
  try {
    const questionsRef = collection(db, "question_packs", packId, "questions");
    const questionsQuery = query(questionsRef, orderBy("order", "asc"));
    const questionsSnapshot = await getDocs(questionsQuery);
    
    const questions = [];
    
    for (const questionDoc of questionsSnapshot.docs) {
      const questionData = questionDoc.data();
      const questionId = questionDoc.id;
      
      // Get options for this question
      const optionsRef = collection(
        db, 
        "question_packs", 
        packId, 
        "questions", 
        questionId, 
        "options"
      );
      const optionsQuery = query(optionsRef, orderBy("order", "asc"));
      const optionsSnapshot = await getDocs(optionsQuery);
      
      const options = optionsSnapshot.docs.map(optionDoc => {
        const optionData = optionDoc.data();
        return {
          id: optionDoc.id,
          text: optionData.text || '',
          isCorrect: Boolean(optionData.isCorrect)
        };
      });
      
      questions.push({
        id: questionId,
        text: questionData.text || '',
        options: options
      });
    }
    
    return questions;
  } catch (error) {
    console.error('Error getting pack questions:', error);
    throw error;
  }
};

/**
 * Update a question in a pack
 */
export const updatePackQuestion = async (packId, questionId, updatedQuestion) => {
  try {
    if (!questionId) {
      // If no questionId provided, add as a new question
      const questionsRef = collection(db, "question_packs", packId, "questions");
      const questionsSnapshot = await getDocs(questionsRef);
      const nextOrder = questionsSnapshot.size;
      
      return await addQuestionToPack(packId, updatedQuestion, nextOrder);
    }
    
    const questionRef = doc(db, "question_packs", packId, "questions", questionId);
    const questionSnapshot = await getDoc(questionRef);
    
    if (!questionSnapshot.exists()) {
      throw new Error('Question not found');
    }
    
    // Update question text
    await updateDoc(questionRef, {
      text: updatedQuestion.text || '',
      updatedAt: serverTimestamp()
    });
    
    // Delete existing options
    const optionsRef = collection(
      db, 
      "question_packs", 
      packId, 
      "questions", 
      questionId, 
      "options"
    );
    const optionsSnapshot = await getDocs(optionsRef);
    
    for (const optionDoc of optionsSnapshot.docs) {
      await deleteDoc(doc(
        db, 
        "question_packs", 
        packId, 
        "questions", 
        questionId, 
        "options", 
        optionDoc.id
      ));
    }
    
    // Add new options
    if (Array.isArray(updatedQuestion.options)) {
      for (let i = 0; i < updatedQuestion.options.length; i++) {
        const option = updatedQuestion.options[i];
        const newOptionsRef = collection(
          db, 
          "question_packs", 
          packId, 
          "questions", 
          questionId, 
          "options"
        );
        
        await addDoc(newOptionsRef, {
          text: option.text || '',
          isCorrect: Boolean(option.isCorrect),
          order: i,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    // Return updated question with options
    return {
      id: questionId,
      text: updatedQuestion.text || '',
      options: updatedQuestion.options || []
    };
  } catch (error) {
    console.error('Error updating pack question:', error);
    throw error;
  }
};

/**
 * Delete a question from a pack
 */
export const deletePackQuestion = async (packId, questionId) => {
  try {
    if (!questionId) {
      throw new Error('Question ID is required');
    }
    
    const questionRef = doc(db, "question_packs", packId, "questions", questionId);
    const questionSnapshot = await getDoc(questionRef);
    
    if (!questionSnapshot.exists()) {
      throw new Error('Question not found');
    }
    
    // Delete all options for this question
    const optionsRef = collection(
      db, 
      "question_packs", 
      packId, 
      "questions", 
      questionId, 
      "options"
    );
    const optionsSnapshot = await getDocs(optionsRef);
    
    for (const optionDoc of optionsSnapshot.docs) {
      await deleteDoc(doc(
        db, 
        "question_packs", 
        packId, 
        "questions", 
        questionId, 
        "options", 
        optionDoc.id
      ));
    }
    
    // Delete the question
    await deleteDoc(questionRef);
    
    // Reorder remaining questions
    const questionsRef = collection(db, "question_packs", packId, "questions");
    const questionsQuery = query(questionsRef, orderBy("order", "asc"));
    const remainingQuestionsSnapshot = await getDocs(questionsQuery);
    
    let i = 0;
    for (const questionDoc of remainingQuestionsSnapshot.docs) {
      await updateDoc(doc(db, "question_packs", packId, "questions", questionDoc.id), {
        order: i++
      });
    }
    await deleteDoc(questionRef);
    
   // Update question count in the pack document
    const packRef = doc(db, "question_packs", packId);
    await updateDoc(packRef, {
      questionCount: increment(-1)   
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting pack question:', error);
    throw error;
  }
};

/**
 * Load all commercials
 */
export async function loadCommercials() {
  try {
    const commercialsQuery = query(commercialsRef, orderBy("date", "desc"));
    const commercialsSnapshot = await getDocs(commercialsQuery);
    
    return commercialsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to JavaScript Date for easier handling
      date: doc.data().date?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Error loading commercials:", error);
    throw error;
  }
}

/**
 * Get a specific commercial by ID
 */
export async function getCommercial(commercialId) {
  try {
    const commercialRef = doc(db, "commercials", commercialId);
    const commercialSnapshot = await getDoc(commercialRef);
    
    if (!commercialSnapshot.exists()) {
      throw new Error("Commercial not found");
    }
    
    const data = commercialSnapshot.data();
    return {
      id: commercialSnapshot.id,
      ...data,
      date: data.date?.toDate() || new Date()
    };
  } catch (error) {
    console.error("Error getting commercial:", error);
    throw error;
  }
}

/**
 * Add a new commercial
 */
export async function saveCommercial(commercialData) {
  try {
    // Format date properly for Firestore
    const dataToSave = {
      ...commercialData,
      date: new Date(commercialData.date),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(commercialsRef, dataToSave);
    
    return {
      id: docRef.id,
      ...commercialData,
      date: new Date(commercialData.date)
    };
  } catch (error) {
    console.error("Error adding commercial:", error);
    throw error;
  }
}

/**
 * Update a commercial
 */
export async function updateCommercial(commercialId, updatedData) {
  try {
    const commercialRef = doc(db, "commercials", commercialId);
    
    // Format date if included
    const dataToUpdate = { ...updatedData };
    if (dataToUpdate.date) {
      dataToUpdate.date = new Date(dataToUpdate.date);
    }
    
    // Add timestamp
    dataToUpdate.updatedAt = serverTimestamp();
    
    await updateDoc(commercialRef, dataToUpdate);
    
    return {
      id: commercialId,
      ...updatedData,
      date: updatedData.date ? new Date(updatedData.date) : undefined
    };
  } catch (error) {
    console.error("Error updating commercial:", error);
    throw error;
  }
}

/**
 * Delete a commercial
 */
export async function deleteCommercial(commercialId) {
  try {
    const commercialRef = doc(db, "commercials", commercialId);
    await deleteDoc(commercialRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting commercial:", error);
    throw error;
  }
} 