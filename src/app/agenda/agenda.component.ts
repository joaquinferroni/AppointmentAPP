import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Appointment } from '../_models/appointment';
import { Day } from '../_models/day';
import { AppointmentService } from '../_services/appointment.service';
import '../_pipes/prototypes';
import { NotificationService } from '../_services/notification.service';
import { LoadingService } from '../_services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit, OnChanges {
  @Input()  selectedDay:Date | null= new Date();
  days : Day[] = [];
  appointments: Appointment[] = [];

  constructor(
    private appointmentService: AppointmentService
    , private notificationService:NotificationService
    , private loadingService:LoadingService
    ,private router: Router
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any) {
    if(changes.selectedDay.previousValue !== changes.selectedDay.currentValue){
      this.loadAppointments();
    }
  }

  loadAppointments(){
    this.appointmentService.myAppointments(this.selectedDay??new Date()).subscribe(data=>{
      this.days= [];
      this.appointments = [];
      this.appointments = data;
      this.loadDays();
    })
  }

  loadDays(){
    let currentDate = this.selectedDay ?? new Date();
    let appointmentsInTheSameDay=[];
    for(let i = 0; i< this.appointments.length;i++){
      let currentAppointment = this.appointments[i];

      if(currentDate.equalTo(new Date(currentAppointment.dateFrom.toString())))
      {
        appointmentsInTheSameDay.push(currentAppointment);
        continue;
      }
      this.days.push(new Day(currentDate,appointmentsInTheSameDay, this.selectedDay?.equalTo(currentDate)??false));
      appointmentsInTheSameDay = [];
      appointmentsInTheSameDay.push(currentAppointment);
      currentDate = new Date(currentAppointment.dateFrom.toString());
    }
    if(appointmentsInTheSameDay.length>0){
      this.days.push(new Day(currentDate,appointmentsInTheSameDay, this.selectedDay?.equalTo(currentDate)??false));
      appointmentsInTheSameDay = [];
    }
  }

  onCancelAppointment(appointmentId:number){
    this.notificationService.confirmation("Est?? seguro que desea cancelar la cita?",()=>{
      debugger;
      const currentUser = JSON.parse(localStorage.getItem("currentUser") ?? '{}');
      this.loadingService.show();
      this.appointmentService.cancelAppointment(appointmentId,currentUser.id).subscribe(res=>{
        this.notificationService.success("Se ha cancelado la cita con exito");
        this.loadAppointments();
        this.loadingService.hide();
      },erro=>{
        this.notificationService.error("Ocurri??n un error al cancelar la cita");
        this.loadingService.hide();
      });
    },"Cancelar Cita",()=>{
    });
  }

  redirectNewAppointment(){
    this.router.navigate(['main/new-appointment']);
  }
}
