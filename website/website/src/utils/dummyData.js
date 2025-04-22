// Dummy data for the quiz management system

export let categories = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "Science" },
  { id: 3, name: "History" },
  { id: 4, name: "Geography" },
  { id: 5, name: "Literature" }
];

export let questionPacks = [
  { 
    id: 1, 
    title: "Basic Math", 
    description: "Fundamental mathematics questions for beginners", 
    timeGiven: 30, 
    difficulty: "Easy", 
    category: "Mathematics",
    questions: [
      {
        id: 1,
        text: "What is 2 + 2?",
        options: [
          { id: 1, text: "3", isCorrect: false },
          { id: 2, text: "4", isCorrect: true },
          { id: 3, text: "5", isCorrect: false },
          { id: 4, text: "6", isCorrect: false }
        ]
      },
      {
        id: 2,
        text: "What is 5 × 5?",
        options: [
          { id: 1, text: "20", isCorrect: false },
          { id: 2, text: "25", isCorrect: true },
          { id: 3, text: "30", isCorrect: false },
          { id: 4, text: "10", isCorrect: false }
        ]
      }
    ]
  },
  { 
    id: 2, 
    title: "World History", 
    description: "Test your knowledge of world history events", 
    timeGiven: 45, 
    difficulty: "Medium", 
    category: "History",
    questions: [
      {
        id: 1,
        text: "When did World War II end?",
        options: [
          { id: 1, text: "1943", isCorrect: false },
          { id: 2, text: "1945", isCorrect: true },
          { id: 3, text: "1947", isCorrect: false },
          { id: 4, text: "1950", isCorrect: false }
        ]
      }
    ]
  },
  { 
    id: 3, 
    title: "Chemistry Basics", 
    description: "Fundamental chemistry concepts", 
    timeGiven: 40, 
    difficulty: "Hard", 
    category: "Science",
    questions: []
  }
];

// Calculate questions count for each category
export const getCategoriesWithCount = () => {
  return categories.map(category => {
    // Get all packs for this category
    const categoryPacks = questionPacks.filter(pack => pack.category === category.name);
    
    // Count questions
    const questionsCount = categoryPacks.reduce((sum, pack) => sum + pack.questions.length, 0);
    
    // Count packs
    const packsCount = categoryPacks.length;
    
    return {
      ...category,
      questionsCount,
      packsCount
    };
  });
};

// Save or update a category
export const saveCategory = (categoryData) => {
  // Check if we're updating an existing category or adding a new one
  if (categoryData.id) {
    // Store the old name to update question packs
    const oldCategory = categories.find(c => c.id === categoryData.id);
    const oldCategoryName = oldCategory?.name;
    
    // Update the category
    categories = categories.map(category =>
      category.id === categoryData.id ? { ...categoryData } : category
    );
    
    // If the name changed, update all question packs using this category
    if (oldCategoryName && oldCategoryName !== categoryData.name) {
      questionPacks = questionPacks.map(pack => 
        pack.category === oldCategoryName 
          ? { ...pack, category: categoryData.name } 
          : pack
      );
    }
  } else {
    // Add new category with a new ID
    const newId = categories.length > 0 
      ? Math.max(...categories.map(c => c.id)) + 1 
      : 1;
    
    categories = [...categories, { ...categoryData, id: newId }];
  }
  
  return getCategoriesWithCount();
};

// Delete a category
export const deleteCategory = (categoryId) => {
  // Get the category name before deleting
  const categoryToDelete = categories.find(c => c.id === categoryId);
  
  if (categoryToDelete) {
    // Remove the category
    categories = categories.filter(category => category.id !== categoryId);
    
    // Optional: Either remove question packs with this category or set them to "Uncategorized"
    // Here we'll set them to "Uncategorized" and create that category if it doesn't exist
    const uncategorizedCategory = categories.find(c => c.name === "Uncategorized");
    
    if (!uncategorizedCategory) {
      const newId = categories.length > 0 
        ? Math.max(...categories.map(c => c.id)) + 1 
        : 1;
      
      categories = [...categories, { id: newId, name: "Uncategorized" }];
    }
    
    // Update question packs
    questionPacks = questionPacks.map(pack => 
      pack.category === categoryToDelete.name 
        ? { ...pack, category: "Uncategorized" } 
        : pack
    );
  }
  
  return getCategoriesWithCount();
};

// Save or update a question pack
export const saveQuestionPack = (packData) => {
  // Check if we're updating an existing pack or adding a new one
  if (packData.id) {
    // Update existing pack
    questionPacks = questionPacks.map(pack =>
      pack.id === packData.id ? { ...packData } : pack
    );
  } else {
    // Add new pack with a new ID
    const newId = questionPacks.length > 0 
      ? Math.max(...questionPacks.map(p => p.id)) + 1 
      : 1;
    
    questionPacks = [...questionPacks, { ...packData, id: newId }];
  }
  
  return questionPacks;
};

// Delete a question pack
export const deleteQuestionPack = (packId) => {
  questionPacks = questionPacks.filter(pack => pack.id !== packId);
  return questionPacks;
};

export const difficulties = ["Easy", "Medium", "Hard"]; 