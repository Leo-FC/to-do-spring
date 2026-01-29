package com.lfc.aligntodo.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Objects;

@AllArgsConstructor
@Getter
public enum TaskPriorityEnum {
    BAIXA(1, "BAIXA"),
    MEDIA(2, "MEDIA"),
    ALTA(3, "ALTA"),
    URGENTE(4, "URGENTE");

    private Integer code;
    private String description;

    @JsonCreator
    public static TaskPriorityEnum toEnum(Integer code){
        if(Objects.isNull(code)){
            return null;
        }

        for(TaskPriorityEnum x : TaskPriorityEnum.values()){
            if(code.equals(x.getCode())){
                return x;
            }
        }

        throw new IllegalArgumentException("No enum constant with code " + code);
    }

    @JsonValue
    public Integer getCode() {
        return code;
    }
}
