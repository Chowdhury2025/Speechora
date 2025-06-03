// // bus-server/types/interface.ts

// export interface IBus {
//   id?: number;
//   name: string;
//   operatorName: string;
//   rating: number | string;
//   contact: string;
//   routeId?: number | null | undefined;
//   seatNumber: number | string;
//   maxSeatNumber: number | string;

//   departureTime: Date;
//   arrivalTime: Date;
//   seats?: ISeat[];
//   route?: IRoute;
//   group: number ;

// }

// export interface ISeat {
//   id?: number;
//   seatNumber: number | string;
//   state: boolean;
//   busId?: number;
//   bus?: IBus;
// }

// export interface IBulkSeatData {
//   seatNumberStart: number;
//   state: boolean;
//   busId: number;
//   bus?: IBus;
//   maxSeatNumber?: number;
// }

// export interface IRoute {
//   id?: number;
//   destination: string;
//   departure: string;
//   duration: number | string;
//   dates: string[];
//   price: number | string;
//   buses?: IBus[];
// }

// export interface IPassenger {
//   id?: number;
//   username: string;
//   email: string;
//   gender: string;
//   age: string;
//   residence: string;
//   price: string;
//   phoneNumber: string;
//   Seat: ISeat[];
//   seatId: number;
//   Bus: IBus;
//   busId: number;
//   departureDate: Date;
// }

export interface IUser {
  id?: number;
  username: String;
  token: String;
  email: String;
  member: String;
  password: String;
  phoneNumber: String;
  nrc_card_id: string;
  role: String;
  ComplaintSuggestion: String;
  warehouseId: any,
  StoreId:any
}
// export interface PaymentObject {
//   id?: number;
//   username: string;
//   email: string;
//   gender: string;
//   age: string;
//   residence: string;
//   price: string;
//   phoneNumber: string;
//   seatId: number;
//   departureDate: Date;
//   busId: number;
//   destination: string;
//   departure: string;
//   merchantReference: string;
// }

export interface ContactDetails {
  customerPhone: string;
  customerEmail: string;
  amount: number;
}
export interface VerifyEmailAndOTPRequest {
  otp: string;
  email: string;
  password: string;
}
