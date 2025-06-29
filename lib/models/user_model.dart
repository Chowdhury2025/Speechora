// ignore_for_file: constant_identifier_names

import 'dart:convert';

enum UserRole {
  ADMIN,
  SUPERUSER,
  INSPECTOR,
  STAFF,
  TEACHER,
  GUARDIAN_PARENT,
  FINANCE,
}

class PremiumInfo {
  final DateTime? expiryDate;
  final String? ageGroup;
  final List<String>? accessTo;
  final List<String>? macAddresses;
  final double? balance;

  PremiumInfo({
    this.expiryDate,
    this.ageGroup,
    this.accessTo,
    this.macAddresses,
    this.balance,
  });

  factory PremiumInfo.fromJson(Map<String, dynamic> json) {
    return PremiumInfo(
      expiryDate:
          json['expiryDate'] != null
              ? DateTime.parse(json['expiryDate'])
              : null,
      ageGroup: json['ageGroup'],
      accessTo:
          json['accessTo'] != null ? List<String>.from(json['accessTo']) : null,
      macAddresses:
          json['macAddresses'] != null
              ? List<String>.from(json['macAddresses'])
              : null,
      balance:
          (json['balance'] != null)
              ? (json['balance'] is int
                  ? (json['balance'] as int).toDouble()
                  : json['balance'] as double)
              : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'expiryDate': expiryDate?.toIso8601String(),
    'ageGroup': ageGroup,
    'accessTo': accessTo,
    'macAddresses': macAddresses,
    'balance': balance,
  };
}

class UserModel {
  final int id;
  final String? username;
  final String? lastName;
  final String? middleName;
  final String? token;
  final String email;
  final String? phoneNumber;
  final int? group;
  final DateTime createdAt;
  final String? nrcCardId;
  final UserRole role;
  final bool isEmailVerified;
  final String? emailVerificationToken;
  final String? bloodGroup;
  final String? address;
  final PremiumInfo? premium;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? emergencyContact;
  UserModel({
    required this.id,
    this.username,
    this.lastName,
    this.middleName,
    this.token,
    required this.email,
    this.phoneNumber,
    this.group,
    required this.createdAt,
    this.nrcCardId,
    required this.role,
    required this.isEmailVerified,
    this.emailVerificationToken,
    this.bloodGroup,
    this.address,
    this.premium,
    this.dateOfBirth,
    this.gender,
    this.emergencyContact,
  });
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      username: json['username'] as String?,
      lastName: json['lastName'] as String?,
      middleName: json['middleName'] as String?,
      token: json['token'] as String?,
      email: json['email'] as String,
      phoneNumber: json['phoneNumber'] as String?,
      group: json['group'] as int?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      nrcCardId: json['nrc_card_id'] as String?,
      role: UserRole.values.firstWhere(
        (role) => role.toString().split('.').last == json['role'],
        orElse: () => UserRole.STAFF,
      ),
      isEmailVerified: json['isEmailVerified'] as bool? ?? false,
      emailVerificationToken: json['emailVerificationToken'] as String?,
      bloodGroup: json['bloodGroup'] as String?,
      address: json['address'] as String?,
      premium:
          json['premium'] != null
              ? (json['premium'] is String
                  ? PremiumInfo.fromJson(jsonDecode(json['premium'] as String))
                  : PremiumInfo.fromJson(
                    json['premium'] as Map<String, dynamic>,
                  ))
              : null,
      dateOfBirth:
          json['dateOfBirth'] != null
              ? DateTime.parse(json['dateOfBirth'] as String)
              : null,
      gender: json['gender'] as String?,
      emergencyContact: json['emergencyContact'] as String?,
    );
  }
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'lastName': lastName,
      'middleName': middleName,
      'token': token,
      'email': email,
      'phoneNumber': phoneNumber,
      'group': group,
      'createdAt': createdAt.toIso8601String(),
      'nrc_card_id': nrcCardId,
      'role': role.toString().split('.').last,
      'isEmailVerified': isEmailVerified,
      'emailVerificationToken': emailVerificationToken,
      'bloodGroup': bloodGroup,
      'address': address,
      'premium': premium?.toJson(),
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'emergencyContact': emergencyContact,
    };
  }

  UserModel copyWith({
    String? username,
    String? lastName,
    String? middleName,
    String? phoneNumber,
    String? bloodGroup,
    String? address,
    DateTime? dateOfBirth,
    String? gender,
    String? emergencyContact,
  }) {
    return UserModel(
      id: id,
      username: username ?? this.username,
      lastName: lastName ?? this.lastName,
      middleName: middleName ?? this.middleName,
      token: token,
      email: email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      group: group,
      createdAt: createdAt,
      nrcCardId: nrcCardId,
      role: role,
      isEmailVerified: isEmailVerified,
      emailVerificationToken: emailVerificationToken,
      bloodGroup: bloodGroup ?? this.bloodGroup,
      address: address ?? this.address,
      premium: premium,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      emergencyContact: emergencyContact ?? this.emergencyContact,
    );
  }

  Map<String, dynamic> toUpdateProfileJson() {
    return {
      'username': username,
      'lastName': lastName,
      'middleName': middleName,
      'phoneNumber': phoneNumber,
      'bloodGroup': bloodGroup,
      'address': address,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'emergencyContact': emergencyContact,
    };
  }
}
