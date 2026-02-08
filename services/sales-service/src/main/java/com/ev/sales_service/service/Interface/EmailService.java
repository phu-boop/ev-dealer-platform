package com.ev.sales_service.service.Interface;

<<<<<<< HEAD
=======

>>>>>>> newrepo/main
import com.ev.sales_service.dto.response.CustomerResponse;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.entity.SalesOrder;

public interface EmailService {
    void sendQuotationEmail(Quotation quotation, CustomerResponse customer);
<<<<<<< HEAD

    void sendQuotationAcceptedEmail(Quotation quotation, CustomerResponse customer);

    void sendQuotationRejectedEmail(Quotation quotation, CustomerResponse customer);

    void sendOrderConfirmedEmail(SalesOrder salesOrder, CustomerResponse customer, String showroomName);
=======
    void sendQuotationAcceptedEmail(Quotation quotation, CustomerResponse customer);
    void sendQuotationRejectedEmail(Quotation quotation, CustomerResponse customer);
    void sendOrderConfirmedEmail(SalesOrder salesOrder, CustomerResponse customer);
>>>>>>> newrepo/main
}
