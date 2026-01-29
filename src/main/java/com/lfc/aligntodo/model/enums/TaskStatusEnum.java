package com.lfc.aligntodo.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Objects;

@AllArgsConstructor
@Getter
public enum TaskStatusEnum {
    NAO_COMECOU(1, "NAO COMECOU"),
    EM_ANDAMENTO(2, "EM ANDAMENTO"),
    CONCLUIDO(3, "CONCLUIDO");

    private Integer code;
    private String description;

    @JsonCreator
    public static TaskStatusEnum toEnum(Integer code){
        if(Objects.isNull(code)){
            return null;
        }

        for(TaskStatusEnum x : TaskStatusEnum.values()){
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
