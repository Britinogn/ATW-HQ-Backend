<template>
  <div @click.self="$emit ('close')"
    class="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center z-auto p-4 overflow-y-auto ">

    <div class="bg-blue-400 rounded-xl max-w-[600px] w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/30">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-300">
        <h2 class=" text-xl font-extrabold ">{{ isEdit ? 'Update Project' : 'Create Project' }} </h2>
        <button 
          @click="$emit('close')"
          type="button"
          class="bg-none border-0 text-white cursor-pointer p-2 rounded transition-all duration-200 ease-in-out "
        >
          <XIcon/>
        </button>
      </div>

      <!--    FORM SECTION -->

      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto  ">

        <!-- Title -->
        <div class="form-group">
          <label for="Project">Project Title</label>
          <input 
            type="text" 
            v-model="formData.title"
            class="input-field"
            placeholder="Enter any project you have built..."
          />

          <span v-if="errors.title"
            class="error-text"
          >
            {{ errors.title }}
          </span>
        </div>

        <div  class="form-group">
          <label for="Project">Description</label>
          <textarea name="" id="" 
            v-model="formData.description"
            rows="4"
            placeholder="Describe your project"
            class="input-field min-h-15 max-h-50"
          ></textarea>
          
          <span v-if="errors.description"
            class="error-text"
          >
            {{ errors.description }}
          </span>

        </div>

        <!-- Tech Stack -->
        <div class="form-group">
          <label for="techStack" class="">Tech Stack</label>
          <input
            id="techStack"
            v-model="techStackString"
            type="text"
            class="input-field"
            placeholder="e.g., React, Node.js, TypeScript"
          />
          <span v-if="errors.techStack"
            class="error-text"
          >
            {{ errors.techStack }}
          </span>
        </div>

        <!-- GitHub URL -->
        <div  class="form-group">
          <label for="githubUrl">GitHub</label>
          <input 
            id="githubUrl"
            type="text"
            v-model="formData.githubUrl"
            placeholder="Link to your github"
            class="input-field"
          />
          
          <span v-if="errors.githubUrl"
            class="error-text"
          >
            {{ errors.githubUrl }}
          </span>

        </div>

        <!-- Live URL -->
        <div  class="form-group">
          <label for="liveURL"> Live URL</label>
          <input 
            id="liveURL"
            type="text"
            v-model="formData.liveURL"
            placeholder="Link to your project"
            class="input-field"
          />
          
          <span v-if="errors.liveURL"
            class="error-text"
          >
            {{ errors.liveURL }}
          </span>

        </div>
        
        
        <!-- Category -->
        <div  class="form-group">
          <label for="category">Category</label>
          <input 
            id="category"
            type="text"
            v-model="formData.category"
            placeholder="Enter the project category"
            class="input-field"
          />
          
          <span v-if="errors.category"
            class="error-text"
          >
            {{ errors.category }}
          </span>

        </div>

        <!-- Year Built -->
        <div  class="form-group">
          <label for="yearBuilt">Year Built</label>
          <input 
            id="yearBuilt"
            type="number"
            v-model.number="formData.yearBuilt"
            placeholder="Enter year you built this project"
            class="input-field"
          />
          
          <span v-if="errors.yearBuilt"
            class="error-text"
          >
            {{ errors.yearBuilt }}
          </span>

        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label>Project Images</label>
          <div class="image-upload">
            <!-- Hidden file input -->
            <input 
              type="file" 
              accept="image/*"
              multiple
              @change="handleImageChange"
              ref="fileInput"
              hidden
            />
            
            <!-- Current Images Preview (for edit mode) -->
            <div v-if="isEdit && existingImages.length > 0" class="mb-4">
              <p class="text-sm text-gray-500 mb-2">Current Images:</p>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="(img, index) in existingImages" :key="`current-${index}`" class="relative">
                  <img 
                    :src="getImageUrl(img)" 
                    alt="Current Image" 
                    class="w-full h-24 object-cover rounded" 
                  />
                  <button 
                    type="button" 
                    @click="removeExistingImage(index)" 
                    class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <TrashIcon :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <!-- New Images Preview -->
            <div v-if="imagePreviews.length > 0" class="mb-4">
              <p class="text-sm text-gray-500 mb-2">New Images to Upload:</p>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="(preview, index) in imagePreviews" :key="`preview-${index}`" class="image-preview relative">
                  <img :src="preview" alt="Preview" class="w-full h-24 object-cover rounded" />
                  <button 
                    type="button" 
                    @click="removeNewImage(index)" 
                    class="remove-image-btn absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <TrashIcon :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Upload Button -->
            <button 
              type="button" 
              @click="triggerFileInput" 
              class="upload-btn w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <UploadIcon :size="24" />
              <span>Choose Images (Max 10)</span>
            </button>

            <!-- Show validation error for images -->
            <span v-if="errors.images" class="error-text mt-2 block">
              {{ errors.images }}
            </span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : (isEdit ? "Update" : "Create") }}
        </button>

        <!-- Global Error -->
        <div v-if="error" class="mt-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {{ error }}
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Project } from '../../types/script'
import ProjectAPI from '../../api/projectAPI'
import { XIcon, TrashIcon, UploadIcon } from 'lucide-vue-next'

interface ProjectProps {
  project?: Project | null
  onSuccess?: () => void
  onClose?: () => void
  onSave?: (data: any) => void
  isEdit?: boolean
}

const props = defineProps<ProjectProps>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const isEdit = computed(() => !!props.project)
const loading = ref(false)
const error = ref('')
const errors = ref<Record<string, string>>({})

// Define types for Cloudinary image format
type CloudinaryImage = {
  url: string;
  public_id: string;
}

// Separate new images from existing images
const imageFiles = ref<File[]>([]) // New files to upload
const imagePreviews = ref<string[]>([]) // Preview URLs for new files
const existingImages = ref<CloudinaryImage[] | string[]>([]) // Existing images (Cloudinary objects or URL strings)
const fileInput = ref<HTMLInputElement | null>(null)

const formData = ref<Project>({
  _id: '',
  title: '',
  description: '',
  techStack: [],
  githubUrl: '',
  liveURL: '',
  imageURL: [],
  category: '',
  yearBuilt: undefined,
  createdAt: '',
  updatedAt: ''
})

// Initialize formData from props.project if provided
onMounted(() => {
  if (props.project) {
    formData.value = { ...props.project }
    // Store existing images separately
    if (props.project.imageURL && Array.isArray(props.project.imageURL)) {
      existingImages.value = [...props.project.imageURL] as CloudinaryImage[] | string[]
    }
  }
})

// Computed for techStackString
const techStackString = computed({
  get: () => {
    if (!formData.value?.techStack) return ''
    return formData.value.techStack.join(', ')
  },
  set: (value: string) => {
    if (!formData.value) return
    const techArray = value.split(',').map(t => t.trim()).filter(t => t.length > 0)
    formData.value.techStack = techArray
  }
})

// Helper to get full image URL
const getImageUrl = (img: any): string => {
  // If img is a string and already a full URL, return it
  if (typeof img === 'string') {
    if (img.startsWith('http')) return img;
    // Prepend backend URL for relative paths
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseURL}${img}`;
  }
  
  // If img is an object with url property (Cloudinary format)
  if (img && img.url) {
    // Cloudinary URLs are already complete
    return img.url;
  }
  
  return '';
}

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Handle image change (multiple files)
const handleImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  // Check total images (existing + new) don't exceed limit
  const totalImages = existingImages.value.length + imageFiles.value.length + files.length
  if (totalImages > 10) {
    errors.value.images = `Maximum 10 images allowed. You have ${existingImages.value.length} existing and trying to add ${imageFiles.value.length + files.length} more.`
    return
  }

  errors.value.images = '' // Clear error

  // Process each file
  files.forEach(file => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errors.value.images = 'Only image files are allowed'
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      errors.value.images = 'Each image must be less than 5MB'
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
    
    // Store file
    imageFiles.value.push(file)
  })

  // Reset file input so same file can be selected again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Remove new image (not yet uploaded)
const removeNewImage = (index: number) => {
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
  errors.value.images = '' // Clear error
}

// Remove existing image (already in database)
const removeExistingImage = (index: number) => {
  existingImages.value.splice(index, 1)
}

// Form validation
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!formData.value?.title || formData.value.title.trim().length < 5) {
    errors.value.title = 'Project title must be at least 5 characters'
    isValid = false
  }

  if (!formData.value?.description || formData.value.description.trim().length < 10) {
    errors.value.description = 'Description must be at least 10 characters'
    isValid = false
  }

  const techArray = techStackString.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
  if (techArray.length < 1) {
    errors.value.techStack = 'At least one tech stack item is required'
    isValid = false
  }

  // Validate at least one image (new or existing)
  const totalImages = existingImages.value.length + imageFiles.value.length
  if (totalImages === 0) {
    errors.value.images = 'At least one image is required'
    isValid = false
  }

  // GitHub URL validation (optional field)
  if (formData.value?.githubUrl && formData.value.githubUrl.trim() && !isValidUrl(formData.value.githubUrl)) {
    errors.value.githubUrl = 'GitHub URL must be a valid URL'
    isValid = false
  }

  // Live URL validation (optional field)
  if (formData.value?.liveURL && formData.value.liveURL.trim() && !isValidUrl(formData.value.liveURL)) {
    errors.value.liveURL = 'Live URL must be a valid URL'
    isValid = false
  }

  // Year Built validation
  if (formData.value?.yearBuilt !== undefined && formData.value?.yearBuilt !== null) {
    const year = Number(formData.value.yearBuilt)
    if (isNaN(year) || year < 1900 || year > 2100) {
      errors.value.yearBuilt = 'Year must be between 1900 and 2100'
      isValid = false
    }
  }

  return isValid
}

// Helper for URL validation
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Handle form submission
const handleSubmit = async (): Promise<void> => {
  // Validate form
  if (!validateForm()) {
    console.log('❌ Validation failed:', errors.value)
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Create FormData object
    const fd = new FormData()

    // Append text fields
    fd.append('title', formData.value.title ?? '')
    fd.append('description', formData.value.description ?? '')
    fd.append('techStack', JSON.stringify(formData.value.techStack ?? []))
    fd.append('githubUrl', formData.value.githubUrl ?? '')
    fd.append('liveURL', formData.value.liveURL ?? '')
    
    // Only append category if it has a value
    if (formData.value.category && formData.value.category.trim()) {
      fd.append('category', formData.value.category.trim())
    }
    
    // Only append yearBuilt if it has a value
    if (formData.value.yearBuilt !== undefined && formData.value.yearBuilt !== null) {
      fd.append('yearBuilt', String(formData.value.yearBuilt))
    }

    // Append existing images URLs (if in edit mode)
    if (isEdit.value && existingImages.value.length > 0) {
      // Extract just the URLs from image objects
      const existingUrls = existingImages.value.map((img: CloudinaryImage | string) => {
        // If img is a string, use it directly
        if (typeof img === 'string') return img;
        // If img is an object with url property, extract the url
        return (img as CloudinaryImage).url || '';
      });
      fd.append('existingImages', JSON.stringify(existingUrls));
    }

    // Append NEW image files
    // IMPORTANT: Use 'images' or 'imageURL' - must match your backend
    imageFiles.value.forEach((file) => {
      fd.append('images', file) // or 'imageURL' if your backend expects that
    })

    // Debug: Log FormData contents
    console.log('📦 FormData being sent:')
    console.log('  - Title:', formData.value.title)
    console.log('  - Description:', formData.value.description)
    console.log('  - TechStack:', formData.value.techStack)
    console.log('  - Existing Images:', existingImages.value)
    console.log('  - New Image Files:', imageFiles.value.length, 'files')
    
    // You can't directly log FormData, but you can iterate it
    for (let pair of fd.entries()) {
      if (pair[1] instanceof File) {
        console.log(`  - ${pair[0]}:`, pair[1].name, `(${pair[1].size} bytes)`)
      } else {
        console.log(`  - ${pair[0]}:`, pair[1])
      }
    }

    // Make API call
    let response
    if (isEdit.value && formData.value._id) {
      console.log('🔄 Updating project:', formData.value._id)
      response = await ProjectAPI.updateProject(formData.value._id, fd)
    } else {
      console.log('✨ Creating new project')
      response = await ProjectAPI.createProject(fd)
    }

    console.log('✅ Project saved successfully!', response)
    
    // Emit events
    emit('save', response)
    if (props.onSuccess) props.onSuccess()
    emit('close')
    
  } catch (err: any) {
    console.error('❌ Error saving project:', err)
    console.error('Error response:', err?.response?.data)
    
    error.value = err?.response?.data?.message || err?.message || 'Failed to save project. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Add your existing styles here */
.form-group {
  margin-bottom: 1rem;
}

.input-field {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}
</style>