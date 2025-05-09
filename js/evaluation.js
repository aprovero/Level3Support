/**
 * CoE Nivel 3 Portal de Soporte - JavaScript de Página de Evaluación
 * 
 * Tabla de Contenidos:
 * 1. Variables Globales y Constantes
 * 2. Inicialización de Página
 * 3. Búsqueda de Información de Capacitación
 * 4. Gestión de Campos del Formulario
 * 5. Validación del Formulario
 * 6. Envío del Formulario
 * 7. Manejo de Éxito
 * 8. Event Listeners
 */

/**
 * 1. Variables Globales y Constantes
 * --------------------------------
 */
// Datos de capacitación actual
let currentTrainingData = null;

// Secciones del formulario
const FORM_SECTIONS = {
    trainingInfo: 'trainingInfoSection',
    trainerEval: 'trainerEvaluationSection',
    contentEval: 'contentEvaluationSection',
    overallExp: 'overallExperienceSection'
};

/**
 * 2. Inicialización de Página
 * --------------------
 */
document.addEventListener('DOMContentLoaded', function() {
    // Despertar el servidor
    wakeUpServer();

    // Inicializar el formulario
    initializeEvaluationForm();
});

/**
 * Inicializar el formulario de evaluación y event listeners
 */
function initializeEvaluationForm() {
    const form = document.getElementById('evaluationForm');
    const fetchButton = document.getElementById('fetchTrainingBtn');
    const trainingIdInput = document.getElementById('trainingId');
    
    // Forzar mayúsculas para ID de capacitación
    if (trainingIdInput) {
        // Convertir a mayúsculas en input
        trainingIdInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
        
        // Establecer placeholder
        trainingIdInput.placeholder = "Ingrese el ID de Capacitación de 10 dígitos (ej., TR25010001)";
        
        // Forzar mayúsculas al pegar
        trainingIdInput.addEventListener('paste', function(e) {
            setTimeout(() => {
                this.value = this.value.toUpperCase();
            }, 0);
        });
        
        // Forzar mayúsculas al perder el foco
        trainingIdInput.addEventListener('blur', function() {
            this.value = this.value.toUpperCase();
        });
    }
    
    // Agregar onclick directo para el botón de búsqueda
    if (fetchButton) {
        fetchButton.onclick = function() {
            console.log("Botón de búsqueda clickeado");
            handleTrainingLookup();
        };
    }
    
    // Agregar event listener para el envío del formulario
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Inicializar grupos de botones de radio para mejor UX
    initializeRatingGroups();
}

/**
 * Inicializar mejoras de UI para grupos de calificación
 */
function initializeRatingGroups() {
    // Agregar efectos hover y clicks de etiqueta para mejor usabilidad
    const ratingGroups = document.querySelectorAll('.rating-group');
    
    ratingGroups.forEach(group => {
        const options = group.querySelectorAll('.rating-option');
        
        options.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const label = option.querySelector('label');
            
            // Hacer que al hacer clic en la etiqueta se seleccione el radio
            if (label && radio) {
                label.addEventListener('click', function() {
                    radio.checked = true;
                });
            }
            
            // Agregar efecto hover para mejor UX
            option.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f0f7ff';
            });
            
            option.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    });
}

/**
 * 3. Búsqueda de Información de Capacitación
 * ----------------------------
 */

/**
 * Manejar el clic del botón de búsqueda de capacitación
 */
function handleTrainingLookup() {
    console.log('Búsqueda de capacitación iniciada');
    const trainingId = document.getElementById('trainingId').value.trim().toUpperCase();
    const fetchStatus = document.getElementById('fetchStatus');
    
    // Limpiar cualquier estado anterior
    if (fetchStatus) {
        fetchStatus.textContent = '';
        fetchStatus.className = 'text-sm mt-2';
        fetchStatus.classList.remove('hidden');
    }
    
    // Validar ID de capacitación
    if (!trainingId) {
        showStatus('Por favor ingrese un ID de Capacitación', 'error');
        return;
    }
    
    // Mostrar estado de carga
    showStatus('Buscando información de capacitación...', 'info');
    
    // Crear la URL de la API
    const trainingEndpoint = API_BASE_URL + '/training/' + trainingId;
    console.log('Obteniendo datos de capacitación desde:', trainingEndpoint);
    
    // Usar fetch directo
    fetch(trainingEndpoint)
        .then(response => {
            console.log('Estado de respuesta:', response.status);
            if (!response.ok) {
                throw new Error(`Capacitación no encontrada (${response.status})`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de capacitación recibidos:', data);
            populateTrainingInfo(data);
            showStatus('Información de capacitación encontrada', 'success');
        })
        .catch(error => {
            console.error('Error al buscar capacitación:', error);
            showStatus('Capacitación no encontrada. Por favor revise el ID e intente de nuevo.', 'error');
        });
}

/**
 * Obtener información de capacitación del servidor
 * @param {string} trainingId - El ID de capacitación a buscar
 */
async function fetchTrainingInfo(trainingId) {
    try {
        console.log('Realizando solicitud a:', API_BASE_URL + API_ENDPOINTS.getTrainingById(trainingId));
        
        // Usar fetch regular para evitar problemas potenciales
        const response = await fetch(API_BASE_URL + API_ENDPOINTS.getTrainingById(trainingId));
        const data = await response.json();
        
        console.log('Datos de capacitación recibidos:', data);
        
        // Si es exitoso, poblar la información de capacitación
        if (response.ok && data) {
            populateTrainingInfo(data);
            showStatus('Información de capacitación encontrada', 'success');
        } else {
            // Manejar respuestas de error
            const errorMessage = data.error || 'Capacitación no encontrada';
            const errorDetails = data.details || 'Por favor revise el ID de Capacitación e intente de nuevo';
            
            showStatus(errorMessage, 'error');
            console.error('Error al obtener información de capacitación:', errorMessage);
        }
    } catch (error) {
        // Manejar errores inesperados
        console.error('Error en fetchTrainingInfo:', error);
        showStatus('Error al conectar con el servidor. Por favor intente más tarde.', 'error');
    }
}

/**
 * Poblar la sección de información de capacitación con datos
 * @param {Object} data - El objeto de datos de capacitación
 */
function populateTrainingInfo(data) {
    // Almacenar los datos de capacitación actuales
    currentTrainingData = data;
    
    // Mostrar información de capacitación
    document.getElementById('displayTrainingTitle').textContent = data.title || '-';
    document.getElementById('displayTrainingDate').textContent = formatDate(new Date(data.date)) || '-';
    document.getElementById('displayTrainer').textContent = data.trainer || '-';
    
    // Establecer campos ocultos del formulario
    document.getElementById('trainingTitle').value = data.title || '';
    document.getElementById('trainingDate').value = data.date || '';
    document.getElementById('trainer').value = data.trainer || '';
    
    // Mostrar la sección de capacitación
    const trainingInfoSection = document.getElementById(FORM_SECTIONS.trainingInfo);
    if (trainingInfoSection) {
        trainingInfoSection.classList.remove('hidden');
    }
}

/**
 * Mostrar mensaje de estado
 * @param {string} message - El mensaje a mostrar
 * @param {string} type - El tipo de mensaje: 'success', 'error', o 'info'
 */
function showStatus(message, type) {
    const fetchStatus = document.getElementById('fetchStatus');
    if (!fetchStatus) return;
    
    fetchStatus.textContent = message;
    fetchStatus.classList.remove('hidden', 'text-green-600', 'text-red-600', 'text-blue-600');
    
    switch (type) {
        case 'success':
            fetchStatus.classList.add('text-green-600');
            break;
        case 'error':
            fetchStatus.classList.add('text-red-600');
            break;
        case 'info':
            fetchStatus.classList.add('text-blue-600');
            break;
    }
}

/**
 * 4. Gestión de Campos del Formulario
 * ----------------------
 */

/**
 * Reiniciar campos del formulario a su estado inicial
 */
function resetForm() {
    const form = document.getElementById('evaluationForm');
    if (!form) return;
    
    // Reiniciar campos del formulario
    form.reset();
    
    // Ocultar sección de información de capacitación
    const trainingInfoSection = document.getElementById(FORM_SECTIONS.trainingInfo);
    if (trainingInfoSection) {
        trainingInfoSection.classList.add('hidden');
    }
    
    // Limpiar mensaje de estado
    const fetchStatus = document.getElementById('fetchStatus');
    if (fetchStatus) {
        fetchStatus.textContent = '';
        fetchStatus.classList.add('hidden');
    }
    
    // Limpiar datos de capacitación
    currentTrainingData = null;
    
    // Limpiar campos de visualización
    document.getElementById('displayTrainingTitle').textContent = '-';
    document.getElementById('displayTrainingDate').textContent = '-';
    document.getElementById('displayTrainer').textContent = '-';
    
    // Limpiar campos ocultos del formulario
    document.getElementById('trainingTitle').value = '';
    document.getElementById('trainingDate').value = '';
    document.getElementById('trainer').value = '';
}

/**
 * 5. Validación del Formulario
 * ----------------
 */

/**
 * Validar el formulario de evaluación antes del envío
 * @returns {boolean} True si el formulario es válido
 */
function validateEvaluationForm() {
    const form = document.getElementById('evaluationForm');
    if (!form) return false;
    
    // Verificar si se ha recuperado la información de capacitación
    if (!currentTrainingData) {
        showErrorMessage(
            'Falta Información de Capacitación', 
            'Por favor busque un ID de Capacitación válido primero',
            '#submit-message-container'
        );
        return false;
    }
    
    // Validar selección de tipo de capacitación
    const locationType = document.getElementById('location');
    if (!locationType || !locationType.value) {
        showErrorMessage(
            'Falta Tipo de Capacitación', 
            'Por favor seleccione el tipo de capacitación (En Línea o Presencial)',
            '#submit-message-container'
        );
        locationType.focus();
        return false;
    }
    
    // Verificar todos los grupos de botones de radio requeridos
    const requiredRadioGroups = [
        'trainerKnowledge', 'trainerClarity', 'trainerResponsiveness', 'trainerEngagement',
        'contentRelevance', 'contentDepth', 'contentMaterials', 'contentBalance',
        'overallSatisfaction', 'recommend'
    ];
    
    for (const groupName of requiredRadioGroups) {
        const selectedOption = form.querySelector(`input[name="${groupName}"]:checked`);
        
        if (!selectedOption) {
            // Encontrar la sección que contiene este grupo
            const radioGroup = form.querySelector(`input[name="${groupName}"]`).closest('.form-section');
            const groupTitle = radioGroup.querySelector('.form-section-title').textContent;
            
            showErrorMessage(
                'Evaluación Incompleta', 
                `Por favor complete todas las calificaciones en la sección "${groupTitle}"`,
                '#submit-message-container'
            );
            
            // Desplazarse a la sección
            radioGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return false;
        }
    }
    
    return true;
}

/**
 * 6. Envío del Formulario
 * ----------------
 */

/**
 * Manejar el envío del formulario
 * @param {Event} e - El evento de envío
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Limpiar mensajes previos
    const messageContainer = document.getElementById('submit-message-container');
    if (messageContainer) {
        messageContainer.innerHTML = '';
    }
    
    // Validar el formulario
    if (!validateEvaluationForm()) {
        return;
    }
    
    // Obtener datos del formulario
    const form = e.target;
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    
    // Deshabilitar botón de envío
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
    }
    
    try {
        // Calcular puntuación promedio incluyendo recomendación
        formValues.averageScore = calculateAverageScore(formValues);
        
        // Enviar al servidor
        const result = await submitEvaluation(formValues);
        
        if (result.success) {
            // Mostrar confirmación de éxito
            showSubmissionConfirmation();
        } else {
            // Mostrar mensaje de error
            showErrorMessage(
                'Error al enviar evaluación', 
                result.error || 'Ocurrió un error desconocido. Por favor intente de nuevo.',
                '#submit-message-container'
            );
        }
    } catch (error) {
        // Manejar error de envío
        showErrorMessage(
            'Error al enviar evaluación', 
            error.message || 'Ocurrió un error inesperado. Por favor intente de nuevo.',
            '#submit-message-container'
        );
    } finally {
        // Restablecer estado del botón
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'ENVIAR EVALUACIÓN';
        }
    }
}

/**
 * Calcular la puntuación promedio de todas las calificaciones
 * @param {Object} formValues - Los valores del formulario
 * @returns {number} La puntuación promedio calculada
 */
function calculateAverageScore(formValues) {
    // Obtener todos los valores de calificación
    const ratings = [
        parseInt(formValues.trainerKnowledge),
        parseInt(formValues.trainerClarity),
        parseInt(formValues.trainerResponsiveness),
        parseInt(formValues.trainerEngagement),
        parseInt(formValues.contentRelevance),
        parseInt(formValues.contentDepth),
        parseInt(formValues.contentMaterials),
        parseInt(formValues.contentBalance),
        parseInt(formValues.overallSatisfaction),
        // Agregar valor de recomendación (5 para Sí, 1 para No)
        formValues.recommend === 'Yes' ? 5 : 1
    ];
    
    // Calcular promedio (suma dividida por número de calificaciones)
    const sum = ratings.reduce((total, rating) => total + rating, 0);
    return (sum / ratings.length).toFixed(2);
}

/**
 * Enviar la evaluación al servidor
 * @param {Object} formValues - Los valores del formulario a enviar
 * @returns {Object} El resultado del envío
 */
async function submitEvaluation(formValues) {
    try {
        console.log('Enviando evaluación con valores:', formValues);
        
        // Ajustar el formato de datos para que coincida con lo que espera el servidor
        // Asegurarse de que recommend esté en el formato correcto
        formValues.recommend = formValues.recommend === 'Yes';
        
        // Enviar al servidor usando fetch directo
        const response = await fetch(API_BASE_URL + API_ENDPOINTS.submitEvaluation, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formValues)
        });
        
        const data = await response.json();
        console.log('Respuesta de evaluación:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Error del servidor');
        }
        
        return { success: true, recordId: data.recordId || data.id };
    } catch (error) {
        console.error('Error al enviar evaluación:', error);
        return { 
            success: false, 
            error: error.message || 'Envío fallido' 
        };
    }
}

/**
 * 7. Manejo de Éxito
 * ----------------
 */

/**
 * Mostrar la confirmación de envío
 */
function showSubmissionConfirmation() {
    // Ocultar formulario y encabezado
    document.querySelector('h1').classList.add('hidden');
    document.querySelector('p.mb-6').classList.add('hidden');
    document.getElementById('evaluationForm').classList.add('hidden');
    
    // Mostrar confirmación
    document.getElementById('submissionConfirmation').classList.remove('hidden');
}

/**
 * 8. Event Listeners
 * ----------------
 */
// No es necesario exportar globalmente a window ya que no hay manejadores en línea en el HTML