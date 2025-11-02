export class MonthlyTicketStats {
  month: string;
  domestic: number;
  international: number;
}

export class TicketsByMonthResponse {
  year: number;
  month: number;
  total: number;
  chartData: MonthlyTicketStats[];
  tickets: any[];
}
