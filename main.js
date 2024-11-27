// Datos de servicios
let services = {};
let fechasDisponibles = {};

// Cargar datos del archivo JSON
async function loadJSON() {
  try {
    const response = await fetch('info.json'); // Asegúrate de que la ruta sea correcta
    const data = await response.json();

    // Asignar los datos a las variables globales
    services = data.services;
    fechasDisponibles = data.fechasDisponibles;

    console.log("Datos cargados:", { services, fechasDisponibles });
  } catch (error) {
    console.error("Error al cargar el archivo JSON:", error);
  }
}

// Llamar a la función al inicio
loadJSON();

// Función para mostrar modal de servicios
function showServiceModal(serviceType) {
  selectedService = serviceType;
  const modal = document.getElementById('serviceModal');
  const details = document.getElementById('serviceDetails');
  const service = services[serviceType];

  let html = `
        <h2 class="title-service">${service.title}</h2>
        <div class="subservices">
    `;

  service.subservices.forEach((subservice, index) => {
    html += `
            <div class="subservice" onclick="selectSubservice('${serviceType}', ${index})">
                <h3>${subservice.name}</h3>
                <p>Precio: $${subservice.price}</p>
            </div>
        `;
  });

  html += '</div>';
  details.innerHTML = html;
  modal.style.display = 'block';
}

// Función para seleccionar subservicio
function selectSubservice(serviceType, index) {
  selectedSubservice = services[serviceType].subservices[index];
  closeModal('serviceModal');
  showAppointmentModal();
}

// Función para mostrar modal de citas
function showAppointmentModal() {
  const modal = document.getElementById('appointmentModal');
  modal.style.display = 'block';
  renderCalendar();
}

// Función para cerrar modales
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Variables del calendario
let currentDate = new Date();

// Función para renderizar el calendario
function renderCalendar() {
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  document.getElementById('currentMonth').textContent =
    `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  let html = '';

  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  weekDays.forEach(day => {
    html += `<div class="calendar-day weekday">${day}</div>`;
  });

  // Días vacíos antes del primer día del mes
  for (let i = 0; i < firstDay.getDay(); i++) {
    html += '<div class="calendar-day"></div>';
  }

  // Días del mes
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = formatDate(date);
    const isDisabled = fechasDisponibles[formattedDate] === "ocupado";

    html += `
            <div class="calendar-day ${isDisabled ? 'disabled' : ''}"
                 onclick="${isDisabled ? '' : `selectDate('${formattedDate}')`}">
                ${day}
            </div>`;
  }

  document.getElementById('calendarDays').innerHTML = html;
}

// Funciones de navegación del calendario
function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

// Función para formatear fechas
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Función para seleccionar fecha
function selectDate(formattedDate) {
  if (fechasDisponibles[formattedDate] !== "ocupado") {
    selectedDate = formattedDate;
    showTimeSelection();
  }
}

// Función para mostrar selección de hora
function showTimeSelection() {
  const appointmentDetails = document.getElementById('appointmentDetails');

  let html = `
        <h2>Selecciona una hora</h2>
        <div class="time-slots">
    `;

  // Horarios disponibles (9 AM a 6 PM)
  for (let hour = 9; hour <= 18; hour++) {
    html += `
            <div class="time-slot" onclick="selectTime('${hour}:00')">
                ${hour}:00
            </div>
        `;
  }

  html += `</div>`;
  appointmentDetails.innerHTML = html;
}

// Función para seleccionar hora
function selectTime(time) {
  selectedTime = time;
  showAppointmentSummary();
}

// Función para mostrar resumen de la cita
function showAppointmentSummary() {
  const appointmentDetails = document.getElementById('appointmentDetails');

  const html = `
        <h2>Resumen de tu cita</h2>
        <div class="appointment-summary">
            <p>Servicio: ${selectedSubservice.name}</p>
            <p>Precio: $${selectedSubservice.price}</p>
            <p>Fecha: ${selectedDate}</p>
            <p>Hora: ${selectedTime}</p>
            <button onclick="sendToWhatsApp()" class="confirm">Confirmar Cita</button>
        </div>
    `;

  appointmentDetails.innerHTML = html;
}

// Función para enviar a WhatsApp
function sendToWhatsApp() {
  const message = `Hola buenas quiera reservar una cita el día ${selectedDate} a las ${selectedTime} para el ${selectedSubservice.name}, este es el precio que me indicaba la página $${selectedSubservice.price} ¿No se si se podrá?`;

  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message);

  // Abrir WhatsApp Web con el mensaje
  window.open(`https://wa.me/+527122080459?text=${encodedMessage}`, '_blank');

  // Cerrar el modal después de enviar
  closeModal('appointmentModal');

  // Resetear las selecciones
  selectedService = null;
  selectedSubservice = null;
  selectedDate = null;
  selectedTime = null;
}

// Event Listeners para cerrar modales al hacer clic fuera
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
  }
}