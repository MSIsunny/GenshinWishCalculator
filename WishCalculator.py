import numpy as np

def main():
    #单次抽卡的概率
    #角色池
    def percent_character(x):
        if x <=73:
            return 0.006
        elif x <= 89:
            return (0.006+0.06*(x-73))
        else:
            return 1
    #武器池
    def percent_weapon(x):
        if x <=62:
            return 0.007
        elif x <= 73:
            return (0.007+0.07*(x-62))
        elif x <= 79:
            return (0.777+0.035*(x-73))
        else:
            return 1
    #初始化一个零矩阵
    size = 180*ExpectedCharacterNum+400*ExpectedWeaponNum+1 #这里加上1是为了让最后一行表示达成抽卡预期的状态
    TPmatrix = np.zeros((size, size))
    #角色池的初始状态设置
    CharacterPoolOffset = 0
    if ExpectedCharacterNum != 0:
        if CharacterPoolGuarantee == False:
            CharacterPoolOffset = CharacterPoolStage
        elif CharacterPoolGuarantee == True:
            CharacterPoolOffset = CharacterPoolStage+90
    #生成转移概率矩阵（矩阵前面的行是武器，后面的行是角色，最后一行表示的状态是已经达成抽卡预期）
    #这一部分代码生成抽武器的状态，如果要抽的武器数为0，那么就不会运行这一部分代码
    for i in range(0, ExpectedWeaponNum):
        offset = 400*i
        for j in range(0, 80):
            x = j % 80 + 1
            if i == ExpectedWeaponNum-1:
                #该行属于要抽的最后一把武器的部分，那么如果出限定就会进入角色部分，要加上角色池的初始偏移量
                TPmatrix[offset+j, offset+400+CharacterPoolOffset] = percent_weapon(x)*0.375
            else:
                #该行不属于要抽的最后一把武器的部分，那么抽完会进入下一把武器
                TPmatrix[offset+j, offset+400] = percent_weapon(x)*0.375
            TPmatrix[offset+j, offset+160] = percent_weapon(x)*0.375
            TPmatrix[offset+j, offset+240] = percent_weapon(x)*0.25
            TPmatrix[offset+j, offset+j+1] = 1-percent_weapon(x)
        for j in range(80, 160):
            x = j % 80 + 1
            if i == ExpectedWeaponNum-1:
                TPmatrix[offset+j, offset+400+CharacterPoolOffset] = percent_weapon(x)*0.5
            else:
                TPmatrix[offset+j, offset+400] = percent_weapon(x)*0.5
            TPmatrix[offset+j, offset+160] = percent_weapon(x)*0.5
            #在p159状态下抽卡必定成功，故一定会转移到p160状态，这里加上条件判断是为了避免覆盖前面的代码
            if j != 159:
                TPmatrix[offset+j, offset+j+1] = 1-percent_weapon(x)
        for j in range(160, 240):
            x = j % 80 + 1
            if i == ExpectedWeaponNum-1:
                TPmatrix[offset+j, offset+400+CharacterPoolOffset] = percent_weapon(x)*0.375
            else:
                TPmatrix[offset+j, offset+400] = percent_weapon(x)*0.375
            TPmatrix[offset+j, offset+320] = percent_weapon(x)*0.625
            TPmatrix[offset+j, offset+j+1] = 1-percent_weapon(x)
        for j in range(240, 320):
            x = j % 80 + 1
            if i == ExpectedWeaponNum-1:
                TPmatrix[offset+j, offset+400+CharacterPoolOffset] = percent_weapon(x)*0.5
            else:
                TPmatrix[offset+j, offset+400] = percent_weapon(x)*0.5
            TPmatrix[offset+j, offset+320] = percent_weapon(x)*0.5
            if j != 319:
                TPmatrix[offset+j, offset+j+1] = 1-percent_weapon(x)
        for j in range(320, 400):
            x = j % 80 + 1
            if i == ExpectedWeaponNum-1:
                TPmatrix[offset+j, offset+400+CharacterPoolOffset] = percent_weapon(x)
            else:
                TPmatrix[offset+j, offset+400] = percent_weapon(x)
            if j != 399:
                TPmatrix[offset+j, offset+j+1] = 1-percent_weapon(x)
    #这一部分代码生成抽角色的状态，如果要抽的角色数为0，那么就不会运行这一部分代码
    for i in range(0, ExpectedCharacterNum):
        offset = 180*i+ExpectedWeaponNum*400
        for j in range(0, 90):
            x = j % 90 + 1
            TPmatrix[offset+j, offset+180] = percent_character(x)*0.5
            TPmatrix[offset+j, offset+90] = percent_character(x)*0.5
            if j != 89:
                TPmatrix[offset+j, offset+j+1] = 1-percent_character(x)
        for j in range(90, 180):
            x = j % 90 + 1
            TPmatrix[offset+j, offset+180] = percent_character(x)
            if j != 179:
                TPmatrix[offset+j, offset+j+1] = 1-percent_character(x)
    #最后一行表示已经达成抽卡预期，所以从该状态到其他状态的概率都是0，到自身的概率为1
    TPmatrix[size-1, size-1] = 1
    #生成初始状态向量，如果抽武器，那么和武器池水位有关，否则和角色池水位有关
    initVector = np.zeros((size))
    if ExpectedWeaponNum != 0:
        if BindingNum == 0:
            if WeaponPoolGuarantee == False:
                initVector[WeaponPoolStage] = 1
            elif WeaponPoolGuarantee == True:
                initVector[WeaponPoolStage+80] = 1
        elif BindingNum == 1:
            if WeaponPoolGuarantee == False:
                initVector[WeaponPoolStage+160] = 1
            elif WeaponPoolGuarantee == True:
                initVector[WeaponPoolStage+240] = 1
        elif BindingNum == 2:
            initVector[WeaponPoolStage+320] = 1
    else:#这里是不抽武器的情况，和角色池水位有关
        initVector[CharacterPoolOffset] = 1
    #将初始状态向量和转移概率矩阵不断相乘，相乘的次数为抽数，得到预期次数后状态的概率分布
    result = initVector
    for i in range(0, IntertwinedFateNum):
        result = result@TPmatrix
    #这里取状态概率向量的最后一个元素，即已经抽到预期的角色和武器的概率
    print("当前情况下抽到",ExpectedCharacterNum,"个限定角色和",ExpectedWeaponNum,"把限定武器的概率为",(result[size-1]*100).round(2), "%")


#拥有的纠缠之缘数量
IntertwinedFateNum = 301
########################## 下为角色池部分 ##########################
#期望抽到角色数（0-7）
ExpectedCharacterNum = 3
#当前是否大保底（True/False）
CharacterPoolGuarantee = True
#角色池的水位（0-89）
CharacterPoolStage = 89
########################## 下为武器池部分 ##########################
#期望抽到武器数（0-5）
ExpectedWeaponNum = 2
#当前是否大保底（True/False）
WeaponPoolGuarantee = False
#武器池的水位（0-79）
WeaponPoolStage = 0
#命定值（0-2）
BindingNum = 0

main()