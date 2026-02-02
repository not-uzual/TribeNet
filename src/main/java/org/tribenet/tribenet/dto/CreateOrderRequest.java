package org.tribenet.tribenet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateOrderRequest {

    @NotNull
    @Min(1)
    private BigDecimal amount;

    private String currency = "INR";
    
    private Long clubId;
}
